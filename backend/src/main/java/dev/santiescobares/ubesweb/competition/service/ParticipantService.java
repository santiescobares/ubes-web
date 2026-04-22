package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionAddParticipantsEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionRemoveParticipantEvent;
import dev.santiescobares.ubesweb.competition.event.participant.CompetitionUpdateParticipantEvent;
import dev.santiescobares.ubesweb.competition.mapper.ParticipantMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.User;
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

    private final static Set<String> CERTIFICATE_FORMATS = Set.of("pdf", "png", "jpg", "jpeg");
    private final static long MAX_CERTIFICATE_FILE_SIZE = 5_242_880;

    private final CompetitionService competitionService;
    private final UserService userService;
    private final StorageService storageService;

    private final ParticipantRepository participantRepository;
    private final CompetitionRepository competitionRepository;

    private final ParticipantMapper participantMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    @Transactional
    public void addParticipants(
            Long competitionId,
            List<ParticipantCreateDTO> participants,
            List<MultipartFile> studentCertificateFiles,
            List<MultipartFile> medicalCertificateFiles
    ) {
        Competition competition = competitionService.getById(competitionId);

        // We map certificate files to their reference name set in DTO, this will help us to access them faster
        Map<String, MultipartFile> studentCertificatesMap = studentCertificateFiles == null ? Map.of() :
                studentCertificateFiles.stream()
                .filter(f -> f.getOriginalFilename() != null && !f.isEmpty())
                .collect(Collectors.toMap(MultipartFile::getOriginalFilename, f -> f));
        Map<String, MultipartFile> medicalCertificatesMap = medicalCertificateFiles == null ? Map.of() :
                medicalCertificateFiles.stream()
                .filter(f -> f.getOriginalFilename() != null && !f.isEmpty())
                .collect(Collectors.toMap(MultipartFile::getOriginalFilename, f -> f));

        User currentUser = userService.getCurrentUser();
        boolean canOverrideSchool = currentUser.getRole().getAuthority().isAtLeast(RoleAuthority.COMPETITION);

        List<MultipartFile> studentFilesBatch = new ArrayList<>(), medicalFilesBatch = new ArrayList<>();
        List<String> studentKeys = new ArrayList<>(), medicalKeys = new ArrayList<>();

        for (ParticipantCreateDTO participantDTO : participants) {
            Participant participant = participantMapper.toEntity(participantDTO);
            participant.setSchool(canOverrideSchool ? participantDTO.school() : currentUser.getSchool());

            if (participantDTO.studentCertificateFileRef() != null) {
                MultipartFile file = studentCertificatesMap.get(participantDTO.studentCertificateFileRef());

                if (file != null) {
                    FileUtil.validateExtension(file, CERTIFICATE_FORMATS);
                    FileUtil.validateSize(file, MAX_CERTIFICATE_FILE_SIZE);

                    String key = StorageService.fileName(file, R2_STUDENT_CERTIFICATES_PATH);
                    participant.setStudentCertificateKey(key);

                    studentKeys.add(key);
                    studentFilesBatch.add(file);
                }
            }
            if (competition.isRequiresMedicalCertificates() && participantDTO.medicalCertificateFileRef() != null) {
                MultipartFile file = medicalCertificatesMap.get(participantDTO.medicalCertificateFileRef());

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

        // Take into account that this method is annotated with @Transactional, that means if entity saving fails, it will get
        // automatically roll-backed, but there's a little problem... files are uploaded to R2 asynchronously! We won't dive deeper
        // into this right now because that'd be a pretty uncommon issue, but could be important to know for future scalability
        competitionRepository.save(competition);

        eventPublisher.publishEvent(new CompetitionAddParticipantsEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                competition.getParticipants()
        ));
    }

    public ParticipantDTO updateParticipant(
            Long id,
            ParticipantUpdateDTO dto,
            MultipartFile newStudentCertificateFile,
            Boolean removeStudentCertificate,
            MultipartFile newMedicalCertificateFile,
            Boolean removeMedicalCertificate
    ) {
        Participant participant = getById(id);
        Competition competition = participant.getCompetition();

        User currentUser = userService.getCurrentUser();
        boolean canOverrideSchool = currentUser.getRole().getAuthority().isAtLeast(RoleAuthority.COMPETITION);

        participantMapper.updateFromDTO(participant, dto);

        if (dto.school() != null && canOverrideSchool) {
            participant.setSchool(dto.school());
        }

        if (removeStudentCertificate != null && removeStudentCertificate) {
            participant.setStudentCertificateKey(null);
        } else {
            if (newStudentCertificateFile != null && !newStudentCertificateFile.isEmpty()) {
                FileUtil.validateExtension(newStudentCertificateFile, CERTIFICATE_FORMATS);
                FileUtil.validateSize(newStudentCertificateFile, MAX_CERTIFICATE_FILE_SIZE);

                String key = StorageService.fileName(newStudentCertificateFile, R2_STUDENT_CERTIFICATES_PATH);
                participant.setStudentCertificateKey(key);
            }
        }

        if (removeMedicalCertificate != null && removeMedicalCertificate) {
            participant.setMedicalCertificateKey(null);
        } else {
            if (competition.isRequiresMedicalCertificates() && newMedicalCertificateFile != null && !newMedicalCertificateFile.isEmpty()) {
                FileUtil.validateExtension(newMedicalCertificateFile, CERTIFICATE_FORMATS);
                FileUtil.validateSize(newMedicalCertificateFile, MAX_CERTIFICATE_FILE_SIZE);

                String key = StorageService.fileName(newMedicalCertificateFile, R2_MEDICAL_CERTIFICATES_PATH);
                participant.setMedicalCertificateKey(key);
            }
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
    public void removeParticipant(Long id) {
        Participant participant = getById(id);
        Competition competition = participant.getCompetition();

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

    private Participant getById(Long id) {
        return participantRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_PARTICIPANT));
    }
}
