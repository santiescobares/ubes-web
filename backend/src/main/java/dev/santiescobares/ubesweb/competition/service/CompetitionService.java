package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.competition.dto.CompetitionCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.CompetitionCreateEvent;
import dev.santiescobares.ubesweb.competition.event.CompetitionDeleteEvent;
import dev.santiescobares.ubesweb.competition.event.CompetitionUpdateEvent;
import dev.santiescobares.ubesweb.competition.mapper.CompetitionMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.document.DocumentService;
import dev.santiescobares.ubesweb.document.dto.DocumentCreateDTO;
import dev.santiescobares.ubesweb.document.dto.DocumentUpdateDTO;
import dev.santiescobares.ubesweb.document.enums.DocumentType;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceAlreadyExistsException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.util.FileUtil;
import dev.santiescobares.ubesweb.util.ImageUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CompetitionService {

    private static final Set<String> REGULATION_DOCUMENT_FORMATS = Set.of("pdf", "doc", "docx");
    private static final long MAX_BANNER_FILE_SIZE = 10_485_760;

    private final StorageService storageService;
    private final DocumentService documentService;

    private final CompetitionRepository competitionRepository;

    private final CompetitionMapper competitionMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    public CompetitionDTO createCompetition(CompetitionCreateDTO dto, MultipartFile bannerFile, MultipartFile regulationDocumentFile) {
        if (dto.endingDate().isBefore(dto.startingDate())) {
            throw new IllegalArgumentException("Invalid competition starting/ending dates");
        }
        if (dto.minParticipants() > dto.maxParticipants()) {
            throw new IllegalArgumentException("Invalid competition participant amounts");
        }

        Competition competition = competitionMapper.toEntity(dto);
        competition.setType(EventType.COMPETITION);

        if (bannerFile != null && !bannerFile.isEmpty()) {
            FileUtil.validateExtension(bannerFile, ImageUtil.IMAGE_FORMATS);
            FileUtil.validateSize(bannerFile.getSize(), MAX_BANNER_FILE_SIZE);

            String bannerKey = storageService.uploadRandomFile(bannerFile, s3Config.getPublicBucket(), R2_EVENT_BANNERS_PATH);
            competition.setBannerKey(bannerKey);
        }

        if (regulationDocumentFile != null && !regulationDocumentFile.isEmpty()) {
            Document regulationDocument;
            try {
                regulationDocument = documentService.createDocumentDinamically(
                        new DocumentCreateDTO(competition.getName(), DocumentType.REGULATION),
                        regulationDocumentFile,
                        REGULATION_DOCUMENT_FORMATS
                );
            } catch (ResourceAlreadyExistsException ignored) {
                String name = competition.getName();
                if (name.length() > 43) {
                    name = name.substring(0, 43);
                }
                regulationDocument = documentService.createDocumentDinamically(
                        new DocumentCreateDTO(
                                name + "-" + String.format("%06d", ThreadLocalRandom.current().nextInt(999999)),
                                DocumentType.REGULATION
                        ),
                        regulationDocumentFile,
                        REGULATION_DOCUMENT_FORMATS
                );
            }
            competition.setRegulationDocument(regulationDocument);
        }

        competition.setRegistrationStatus(RegistrationStatus.UNAVAILABLE);
        competition.setStatus(CompetitionStatus.SCHEDULED);

        competitionRepository.save(competition);

        eventPublisher.publishEvent(new CompetitionCreateEvent(RequestContextHolder.getCurrentSession().userId(), competition));

        return competitionMapper.toDTO(competition);
    }

    public CompetitionDTO updateCompetition(
            Long id,
            CompetitionUpdateDTO dto,
            MultipartFile newBannerFile,
            Boolean removeBanner,
            MultipartFile newRegulationDocumentFile,
            Boolean removeRegulationDocument
    ) {
        Competition competition = getById(id);

        LocalDateTime finalStartingDate = dto.startingDate() != null ? dto.startingDate() : competition.getStartingDate();
        LocalDateTime finalEndingDate = dto.endingDate() != null ? dto.endingDate() : competition.getEndingDate();

        if (finalStartingDate != null && finalEndingDate != null && finalEndingDate.isBefore(finalStartingDate)) {
            throw new IllegalArgumentException("Invalid competition starting/ending dates");
        }

        int finalMinParticipants = dto.minParticipants() != null ? dto.minParticipants() : competition.getMinParticipants();
        int finalMaxParticipants = dto.maxParticipants() != null ? dto.maxParticipants() : competition.getMaxParticipants();

        if (finalMinParticipants > finalMaxParticipants) {
            throw new IllegalArgumentException("Invalid competition participant amounts");
        }

        competitionMapper.updateFromDTO(competition, dto);

        if (removeBanner != null && removeBanner) {
            competition.setBannerKey(null);
        } else {
            if (newBannerFile != null && !newBannerFile.isEmpty()) {
                FileUtil.validateExtension(newBannerFile, ImageUtil.IMAGE_FORMATS);
                FileUtil.validateSize(newBannerFile.getSize(), MAX_BANNER_FILE_SIZE);

                String bannerKey = storageService.uploadRandomFile(newBannerFile, s3Config.getPublicBucket(), R2_EVENT_BANNERS_PATH);
                competition.setBannerKey(bannerKey);
            }
        }

        if (removeRegulationDocument != null && removeRegulationDocument) {
            if (competition.getRegulationDocument() != null) {
                documentService.deleteDocument(competition.getRegulationDocument());
            }
        } else {
            if (newRegulationDocumentFile != null && !newRegulationDocumentFile.isEmpty()) {
                if (competition.getRegulationDocument() != null) {
                    documentService.updateDocumentDynamically(
                            competition.getRegulationDocument(),
                            new DocumentUpdateDTO(null, null),
                            newRegulationDocumentFile,
                            REGULATION_DOCUMENT_FORMATS
                    );
                } else {
                    competition.setRegulationDocument(documentService.createDocumentDinamically(
                            new DocumentCreateDTO(competition.getName(), DocumentType.REGULATION),
                            newRegulationDocumentFile,
                            REGULATION_DOCUMENT_FORMATS
                    ));
                }
            }
        }

        competitionRepository.save(competition);

        eventPublisher.publishEvent(new CompetitionUpdateEvent(RequestContextHolder.getCurrentSession().userId(), competition));

        return competitionMapper.toDTO(competition);
    }

    @Transactional
    public CompetitionDTO scheduleCompetitionRegistration(Long id, LocalDateTime startingDate, LocalDateTime endingDate) {
        Competition competition = getById(id);
        if (competition.getRegistrationStatus() == RegistrationStatus.AVAILABLE) {
            throw new InvalidOperationException("Competition is already under registration stage");
        }
        if (LocalDateTime.now().isAfter(competition.getStartingDate())) {
            throw new InvalidOperationException("Competition has already started");
        }

        if (endingDate.isBefore(startingDate)) {
            throw new IllegalArgumentException("Invalid competition registration starting/ending dates");
        }

        competition.setRegistrationStartingDate(startingDate);
        competition.setRegistrationEndingDate(endingDate);
        competition.setRegistrationStatus(RegistrationStatus.SCHEDULED);

        eventPublisher.publishEvent(new CompetitionUpdateEvent(RequestContextHolder.getCurrentSession().userId(), competition));

        return competitionMapper.toDTO(competition);
    }

    @Transactional
    public void openCompetitionRegistration(Long id) {
        Competition competition = getById(id);

        if (competition.getRegistrationStatus() == RegistrationStatus.AVAILABLE) {
            throw new InvalidOperationException("Competition is already under registration stage");
        }

        competition.setRegistrationStatus(RegistrationStatus.AVAILABLE);

        log.info("Competition '{}' registration is now available", competition.getId());
    }

    @Transactional
    public void closeCompetitionRegistration(Competition competition, boolean cancel) {
        if (competition.getRegistrationStatus() != RegistrationStatus.AVAILABLE) {
            throw new InvalidOperationException("Competition is not under registration stage");
        }

        competition.setRegistrationStatus(cancel ? RegistrationStatus.CANCELED : RegistrationStatus.EXPIRED);

        log.info("Competition '{}' registration is no longer available", competition.getId());
    }

    @Transactional
    public void closeCompetitionRegistration(Long id, boolean cancel) {
        closeCompetitionRegistration(getById(id), cancel);
    }

    @Transactional
    public void startCompetition(Long id) {
        Competition competition = getById(id);

        if (competition.getStatus() == CompetitionStatus.ON_GOING) {
            throw new InvalidOperationException("Competition is already on going");
        }

        if (competition.getRegistrationStatus() == RegistrationStatus.AVAILABLE) {
            closeCompetitionRegistration(competition, false);
        }

        competition.setStatus(CompetitionStatus.ON_GOING);
    }

    @Transactional
    public void endCompetition(Competition competition) {
        if (competition.getStatus() != CompetitionStatus.ON_GOING) {
            throw new InvalidOperationException("Competition is not on going");
        }

        competition.setStatus(CompetitionStatus.FINISHED);
    }

    @Transactional
    public void endCompetition(Long id) {
        endCompetition(getById(id));
    }

    @Transactional
    public CompetitionDTO cancelCompetition(Long id) {
        Competition competition = getById(id);
        if (competition.getStatus() == CompetitionStatus.CANCELED) {
            throw new InvalidOperationException("Competition is already canceled");
        }

        if (competition.getRegistrationStatus() == RegistrationStatus.AVAILABLE) {
            closeCompetitionRegistration(competition, true);
        }

        competition.setStatus(CompetitionStatus.CANCELED);

        eventPublisher.publishEvent(new CompetitionUpdateEvent(RequestContextHolder.getCurrentSession().userId(), competition));

        return competitionMapper.toDTO(competition);
    }

    @Transactional
    public void deleteCompetition(Long id) {
        Competition competition = getById(id);
        if (competition.getStatus() != CompetitionStatus.CANCELED) {
            throw new InvalidOperationException("Can't delete competition unless it's been canceled");
        }

        competitionRepository.delete(competition);

        eventPublisher.publishEvent(new CompetitionDeleteEvent(RequestContextHolder.getCurrentSession().userId(), competition));
    }

    @Transactional(readOnly = true)
    public CompetitionDTO getCompetitionDTO(Long id) {
        return competitionMapper.toDTO(getById(id));
    }

    @Transactional(readOnly = true)
    public Page<CompetitionDTO> getCompetitionDTOs(Pageable pageable) {
        return competitionRepository.findAll(pageable).map(competitionMapper::toDTO);
    }

    public Competition getById(Long id) {
        return competitionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION));
    }
}
