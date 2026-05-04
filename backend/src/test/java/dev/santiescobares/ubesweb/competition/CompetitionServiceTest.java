package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.dto.CompetitionCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.CompetitionCreateEvent;
import dev.santiescobares.ubesweb.competition.event.CompetitionDeleteEvent;
import dev.santiescobares.ubesweb.competition.event.CompetitionUpdateEvent;
import dev.santiescobares.ubesweb.competition.mapper.CompetitionMapper;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.document.DocumentService;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CompetitionServiceTest {

    @Mock StorageService storageService;
    @Mock DocumentService documentService;
    @Mock CompetitionRepository competitionRepository;
    @Mock CompetitionMapper competitionMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks CompetitionService competitionService;

    @BeforeEach
    void setUp() {
        RequestContextHolder.setCurrentSession(new RequestContextData(UUID.randomUUID(), Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- createCompetition ---

    @Test
    void createCompetition_withEndBeforeStart_throwsIllegalArgumentException() {
        CompetitionCreateDTO dto = new CompetitionCreateDTO(
                "Torneo", null,
                LocalDateTime.now().plusDays(5),
                LocalDateTime.now().plusDays(2),
                null, 5, 10, false, false
        );

        assertThatThrownBy(() -> competitionService.createCompetition(dto, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("dates");
    }

    @Test
    void createCompetition_withMinGreaterThanMax_throwsIllegalArgumentException() {
        CompetitionCreateDTO dto = new CompetitionCreateDTO(
                "Torneo", null,
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(5),
                null, 20, 10, false, false
        );

        assertThatThrownBy(() -> competitionService.createCompetition(dto, null, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("participant");
    }

    @Test
    void createCompetition_withValidData_savesAndReturnsDTO() {
        CompetitionCreateDTO dto = new CompetitionCreateDTO(
                "Torneo", null,
                LocalDateTime.now().plusDays(1),
                LocalDateTime.now().plusDays(5),
                null, 5, 20, false, false
        );
        Competition competition = new Competition();
        competition.setId(1L);
        competition.setName("Torneo");
        CompetitionDTO competitionDTO = mock(CompetitionDTO.class);

        when(competitionMapper.toEntity(dto)).thenReturn(competition);
        when(competitionMapper.toDTO(competition)).thenReturn(competitionDTO);

        CompetitionDTO result = competitionService.createCompetition(dto, null, null);

        assertThat(result).isEqualTo(competitionDTO);
        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.UNAVAILABLE);
        assertThat(competition.getStatus()).isEqualTo(CompetitionStatus.SCHEDULED);
        verify(competitionRepository).save(competition);
        verify(eventPublisher).publishEvent(any(CompetitionCreateEvent.class));
    }

    // --- scheduleCompetitionRegistration ---

    @Test
    void scheduleRegistration_whenAlreadyAvailable_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);
        competition.setStartingDate(LocalDateTime.now().plusDays(3));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.scheduleCompetitionRegistration(
                1L, LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(2)))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void scheduleRegistration_whenCompetitionAlreadyStarted_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.ON_GOING, RegistrationStatus.SCHEDULED);
        competition.setStartingDate(LocalDateTime.now().minusDays(1));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.scheduleCompetitionRegistration(
                1L, LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(2)))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void scheduleRegistration_withInvalidDates_throwsIllegalArgumentException() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.UNAVAILABLE);
        competition.setStartingDate(LocalDateTime.now().plusDays(10));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.scheduleCompetitionRegistration(
                1L, LocalDateTime.now().plusDays(3), LocalDateTime.now().plusDays(1)))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void scheduleRegistration_withValidDates_setsScheduledStatus() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.UNAVAILABLE);
        competition.setStartingDate(LocalDateTime.now().plusDays(10));
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));
        when(competitionMapper.toDTO(competition)).thenReturn(mock(CompetitionDTO.class));

        competitionService.scheduleCompetitionRegistration(
                1L, LocalDateTime.now().plusDays(1), LocalDateTime.now().plusDays(3));

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.SCHEDULED);
        verify(eventPublisher).publishEvent(any(CompetitionUpdateEvent.class));
    }

    // --- openCompetitionRegistration ---

    @Test
    void openRegistration_whenAlreadyAvailable_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.openCompetitionRegistration(1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void openRegistration_valid_setsAvailableStatus() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.SCHEDULED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        competitionService.openCompetitionRegistration(1L);

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.AVAILABLE);
    }

    // --- closeCompetitionRegistration ---

    @Test
    void closeRegistration_whenNotAvailable_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.SCHEDULED);

        assertThatThrownBy(() -> competitionService.closeCompetitionRegistration(competition, false))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void closeRegistration_withCancel_setsCanceledStatus() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);

        competitionService.closeCompetitionRegistration(competition, true);

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.CANCELED);
    }

    @Test
    void closeRegistration_withoutCancel_setsExpiredStatus() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);

        competitionService.closeCompetitionRegistration(competition, false);

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.EXPIRED);
    }

    // --- startCompetition ---

    @Test
    void startCompetition_whenAlreadyOnGoing_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.ON_GOING, RegistrationStatus.EXPIRED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.startCompetition(1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void startCompetition_withActiveRegistration_closesRegistrationFirst() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        competitionService.startCompetition(1L);

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.EXPIRED);
        assertThat(competition.getStatus()).isEqualTo(CompetitionStatus.ON_GOING);
    }

    // --- endCompetition ---

    @Test
    void endCompetition_whenNotOnGoing_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.UNAVAILABLE);

        assertThatThrownBy(() -> competitionService.endCompetition(competition))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void endCompetition_valid_setsFinishedStatus() {
        Competition competition = competitionWith(CompetitionStatus.ON_GOING, RegistrationStatus.EXPIRED);

        competitionService.endCompetition(competition);

        assertThat(competition.getStatus()).isEqualTo(CompetitionStatus.FINISHED);
        verify(eventPublisher).publishEvent(any(CompetitionUpdateEvent.class));
    }

    // --- cancelCompetition ---

    @Test
    void cancelCompetition_whenAlreadyCanceled_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.CANCELED, RegistrationStatus.CANCELED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.cancelCompetition(1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void cancelCompetition_withActiveRegistration_closesRegistrationFirst() {
        Competition competition = competitionWith(CompetitionStatus.SCHEDULED, RegistrationStatus.AVAILABLE);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));
        when(competitionMapper.toDTO(competition)).thenReturn(mock(CompetitionDTO.class));

        competitionService.cancelCompetition(1L);

        assertThat(competition.getRegistrationStatus()).isEqualTo(RegistrationStatus.CANCELED);
        assertThat(competition.getStatus()).isEqualTo(CompetitionStatus.CANCELED);
    }

    // --- deleteCompetition ---

    @Test
    void deleteCompetition_whenNotCanceled_throwsInvalidOperationException() {
        Competition competition = competitionWith(CompetitionStatus.FINISHED, RegistrationStatus.EXPIRED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        assertThatThrownBy(() -> competitionService.deleteCompetition(1L))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void deleteCompetition_whenCanceled_deletesAndPublishesEvent() {
        Competition competition = competitionWith(CompetitionStatus.CANCELED, RegistrationStatus.CANCELED);
        when(competitionRepository.findById(1L)).thenReturn(Optional.of(competition));

        competitionService.deleteCompetition(1L);

        verify(competitionRepository).delete(competition);
        verify(eventPublisher).publishEvent(any(CompetitionDeleteEvent.class));
    }

    // --- getById ---

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        when(competitionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> competitionService.getById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- getCompetitionDTOs ---

    @Test
    void getCompetitionDTOs_returnsMappedPage() {
        Competition competition = new Competition();
        CompetitionDTO dto = mock(CompetitionDTO.class);
        Page<Competition> page = new PageImpl<>(List.of(competition));
        PageRequest pageable = PageRequest.of(0, 10);

        when(competitionRepository.findAll(pageable)).thenReturn(page);
        when(competitionMapper.toDTO(competition)).thenReturn(dto);

        Page<CompetitionDTO> result = competitionService.getCompetitionDTOs(pageable);

        assertThat(result.getContent()).containsExactly(dto);
    }

    // --- helpers ---

    private Competition competitionWith(CompetitionStatus status, RegistrationStatus registrationStatus) {
        Competition competition = new Competition();
        competition.setId(1L);
        competition.setName("Torneo Test");
        competition.setStatus(status);
        competition.setRegistrationStatus(registrationStatus);
        return competition;
    }
}
