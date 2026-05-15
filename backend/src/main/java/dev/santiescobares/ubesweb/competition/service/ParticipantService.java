package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionAddParticipantsEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionRemoveParticipantEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionUpdateParticipantEvent;
import dev.santiescobares.ubesweb.competition.mapper.ParticipantMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.enums.School;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceAlreadyExistsException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.UserService;
import dev.santiescobares.ubesweb.util.FileUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
public class ParticipantService {

    private static final Set<String> CERTIFICATE_FORMATS = Set.of("pdf", "png", "jpg", "jpeg");
    private static final long MAX_CERTIFICATE_FILE_SIZE = 5_242_880;

    private final CompetitionService competitionService;
    private final UserService userService;
    private final StorageService storageService;

    private final ParticipantRepository participantRepository;
    private final CompetitionRepository competitionRepository;

    private final ParticipantMapper participantMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    @Transactional
    public ParticipantDTO addParticipant(
            Long competitionId,
            ParticipantCreateDTO dto,
            MultipartFile studentCertificateFile,
            MultipartFile medicalCertificateFile
    ) {
        Competition competition = competitionService.getById(competitionId);

        validateCompetitionStatus(competition);
        validateDelegateScope(dto.school());
        validateNoDuplicateDocument(competitionId, dto);
        validateMaxCoaches(competition, dto);

        Participant participant = participantMapper.toEntity(dto);
        participant.setSchool(dto.school());

        String studentKey = uploadCertificate(studentCertificateFile, R2_STUDENT_CERTIFICATES_PATH);
        if (studentKey != null) participant.setStudentCertificateKey(studentKey);

        if (competition.isRequiresMedicalCertificates()) {
            String medicalKey = uploadCertificate(medicalCertificateFile, R2_MEDICAL_CERTIFICATES_PATH);
            if (medicalKey != null) participant.setMedicalCertificateKey(medicalKey);
        }

        competition.addParticipant(participant);
        competitionRepository.save(competition);

        eventPublisher.publishEvent(new CompetitionAddParticipantsEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                List.of(participant)
        ));

        return participantMapper.toDTO(participant);
    }

    @Transactional
    public void addParticipants(
            Long competitionId,
            List<ParticipantCreateDTO> dtos,
            List<MultipartFile> studentCertificateFiles,
            List<MultipartFile> medicalCertificateFiles
    ) {
        Competition competition = competitionService.getById(competitionId);

        validateCompetitionStatus(competition);

        Map<String, MultipartFile> studentCertificatesMap = filesToMap(studentCertificateFiles);
        Map<String, MultipartFile> medicalCertificatesMap = filesToMap(medicalCertificateFiles);

        List<MultipartFile> studentFilesBatch = new ArrayList<>(), medicalFilesBatch = new ArrayList<>();
        List<String> studentKeys = new ArrayList<>(), medicalKeys = new ArrayList<>();

        for (ParticipantCreateDTO dto : dtos) {
            validateDelegateScope(dto.school());
            validateNoDuplicateDocument(competitionId, dto);
            validateMaxCoaches(competition, dto);

            Participant participant = participantMapper.toEntity(dto);
            participant.setSchool(dto.school());

            if (dto.studentCertificateFileRef() != null) {
                MultipartFile file = studentCertificatesMap.get(dto.studentCertificateFileRef());
                if (file != null) {
                    FileUtil.validateExtension(file, CERTIFICATE_FORMATS);
                    FileUtil.validateSize(file, MAX_CERTIFICATE_FILE_SIZE);
                    String key = StorageService.fileName(file, R2_STUDENT_CERTIFICATES_PATH);
                    participant.setStudentCertificateKey(key);
                    studentKeys.add(key);
                    studentFilesBatch.add(file);
                }
            }
            if (competition.isRequiresMedicalCertificates() && dto.medicalCertificateFileRef() != null) {
                MultipartFile file = medicalCertificatesMap.get(dto.medicalCertificateFileRef());
                if (file != null) {
                    FileUtil.validateExtension(file, CERTIFICATE_FORMATS);
                    FileUtil.validateSize(file, MAX_CERTIFICATE_FILE_SIZE);
                    String key = StorageService.fileName(file, R2_MEDICAL_CERTIFICATES_PATH);
                    participant.setMedicalCertificateKey(key);
                    medicalKeys.add(key);
                    medicalFilesBatch.add(file);
                }
            }

            competition.addParticipant(participant);
        }

        if (!studentFilesBatch.isEmpty()) {
            storageService.uploadFilesInParallel(studentFilesBatch, s3Config.getPrivateBucket(), studentKeys);
        }
        if (!medicalFilesBatch.isEmpty()) {
            storageService.uploadFilesInParallel(medicalFilesBatch, s3Config.getPrivateBucket(), medicalKeys);
        }

        competitionRepository.save(competition);

        eventPublisher.publishEvent(new CompetitionAddParticipantsEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                competition.getParticipants()
        ));
    }

    public ParticipantDTO updateParticipant(
            Long competitionId,
            Long participantId,
            ParticipantUpdateDTO dto,
            MultipartFile newStudentCertificateFile,
            MultipartFile newMedicalCertificateFile
    ) {
        Participant participant = getById(participantId);
        Competition competition = participant.getCompetition();

        if (!competition.getId().equals(competitionId)) {
            throw new InvalidOperationException("Participant does not belong to the specified competition");
        }

        validateCompetitionStatus(competition);
        validateDelegateScope(participant.getSchool());
        if (dto.school() != null) validateDelegateScope(dto.school());

        if (dto.idType() != null && dto.idNumber() != null) {
            if (participantRepository.existsByCompetitionIdAndIdTypeAndIdNumberAndIdNot(
                    competitionId, dto.idType(), dto.idNumber(), participantId)) {
                throw new ResourceAlreadyExistsException(ResourceType.COMPETITION_PARTICIPANT);
            }
        }

        participantMapper.updateFromDTO(participant, dto);

        if (Boolean.TRUE.equals(dto.removeStudentCertificate())) {
            participant.setStudentCertificateKey(null);
        } else {
            String key = uploadCertificate(newStudentCertificateFile, R2_STUDENT_CERTIFICATES_PATH);
            if (key != null) participant.setStudentCertificateKey(key);
        }

        if (Boolean.TRUE.equals(dto.removeMedicalCertificate())) {
            participant.setMedicalCertificateKey(null);
        } else if (competition.isRequiresMedicalCertificates()) {
            String key = uploadCertificate(newMedicalCertificateFile, R2_MEDICAL_CERTIFICATES_PATH);
            if (key != null) participant.setMedicalCertificateKey(key);
        }

        participantRepository.save(participant);

        eventPublisher.publishEvent(new CompetitionUpdateParticipantEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                participant
        ));

        return participantMapper.toDTO(participant);
    }

    @Transactional
    public void removeParticipant(Long competitionId, Long participantId) {
        Participant participant = getById(participantId);
        Competition competition = participant.getCompetition();

        if (!competition.getId().equals(competitionId)) {
            throw new InvalidOperationException("Participant does not belong to the specified competition");
        }

        validateCompetitionStatus(competition);
        validateDelegateScope(participant.getSchool());

        competition.removeParticipant(participant);

        eventPublisher.publishEvent(new CompetitionRemoveParticipantEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                participant
        ));
    }

    @Transactional(readOnly = true)
    public Page<ParticipantDTO> getParticipantDTOs(Long competitionId, Pageable pageable) {
        return participantRepository.findAllByCompetitionId(competitionId, pageable)
                .map(participantMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ParticipantDTO> getParticipantDTOs(Long competitionId, Long id, String search, Pageable pageable) {
        Long resolvedId = id;
        if (resolvedId == null && search != null && search.matches("^\\d+$")) {
            resolvedId = Long.parseLong(search);
        }
        return participantRepository.findAllByFilters(competitionId, resolvedId, search, pageable)
                .map(participantMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public Page<ParticipantDTO> getParticipantDTOs(Long competitionId, Long id, String search, ParticipantRole role, Pageable pageable) {
        Long resolvedId = id;
        if (resolvedId == null && search != null && search.matches("^\\d+$")) {
            resolvedId = Long.parseLong(search);
        }
        return participantRepository.findAllByFiltersAndRole(competitionId, resolvedId, search, role, pageable)
                .map(participantMapper::toDTO);
    }

    public Participant getById(Long id) {
        return participantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_PARTICIPANT));
    }

    private void validateCompetitionStatus(Competition competition) {
        RegistrationStatus reg = competition.getRegistrationStatus();
        CompetitionStatus status = competition.getStatus();

        if (reg == RegistrationStatus.AVAILABLE) return;

        boolean isExecutiveOrCompetition = RequestContextHolder.hasAuthority(
                RoleAuthority.EXECUTIVE, RoleAuthority.COMPETITION);
        boolean inExecutiveWindow = (reg == RegistrationStatus.EXPIRED)
                && status == CompetitionStatus.SCHEDULED;

        if (!isExecutiveOrCompetition || !inExecutiveWindow) {
            throw new InvalidOperationException("Can't modify competition participants data at this time");
        }
    }

    private void validateDelegateScope(School participantSchool) {
        boolean isDelegateOnly = RequestContextHolder.hasAuthority(RoleAuthority.DELEGATE)
                && !RequestContextHolder.hasAuthority(RoleAuthority.EXECUTIVE, RoleAuthority.COMPETITION);
        if (!isDelegateOnly) return;

        School callerSchool = userService.getCurrentUser().getSchool();
        if (callerSchool != participantSchool) {
            throw new InvalidOperationException("Delegates can only operate on participants from their own school");
        }
    }

    private void validateNoDuplicateDocument(Long competitionId, ParticipantCreateDTO dto) {
        if (participantRepository.existsByCompetitionIdAndIdTypeAndIdNumber(
                competitionId, dto.idType(), dto.idNumber())) {
            throw new ResourceAlreadyExistsException(ResourceType.COMPETITION_PARTICIPANT);
        }
    }

    private void validateMaxCoaches(Competition competition, ParticipantCreateDTO dto) {
        if (dto.role() == ParticipantRole.COACH) {
            long currentCoaches = competition.getParticipants().stream()
                    .filter(p -> p.getRole() == ParticipantRole.COACH && p.getSchool() == dto.school())
                    .count();
            if (currentCoaches >= competition.getMaxCoaches()) {
                throw new InvalidOperationException("Max coaches limit reached for school " + dto.school());
            }
        }
    }

    private String uploadCertificate(MultipartFile file, String path) {
        if (file == null || file.isEmpty()) return null;
        FileUtil.validateExtension(file, CERTIFICATE_FORMATS);
        FileUtil.validateSize(file, MAX_CERTIFICATE_FILE_SIZE);
        String key = StorageService.fileName(file, path);
        storageService.uploadFile(file, s3Config.getPrivateBucket(), key);
        return key;
    }

    private Map<String, MultipartFile> filesToMap(List<MultipartFile> files) {
        if (files == null) return Map.of();
        return files.stream()
                .filter(f -> f.getOriginalFilename() != null && !f.isEmpty())
                .collect(Collectors.toMap(MultipartFile::getOriginalFilename, f -> f));
    }
}
