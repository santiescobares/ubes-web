package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import dev.santiescobares.ubesweb.competition.enums.RegistrationStatus;
import dev.santiescobares.ubesweb.competition.event.result.CompetitionResultUpdateEvent;
import dev.santiescobares.ubesweb.competition.event.result.CompetitionResultsCalculatedEvent;
import dev.santiescobares.ubesweb.competition.id.ResultId;
import dev.santiescobares.ubesweb.competition.mapper.ResultMapper;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
import dev.santiescobares.ubesweb.competition.repository.ResultRepository;
import dev.santiescobares.ubesweb.competition.service.CompetitionService;
import dev.santiescobares.ubesweb.competition.service.ParticipantService;
import dev.santiescobares.ubesweb.competition.service.ResultService;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.time.LocalDate;
import java.time.Month;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResultServiceTest {

    @Mock CompetitionService competitionService;
    @Mock ParticipantService participantService;
    @Mock ResultRepository resultRepository;
    @Mock ParticipantRepository participantRepository;
    @Mock ResultMapper resultMapper;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks ResultService resultService;

    @BeforeEach
    void setUp() {
        RequestContextHolder.setCurrentSession(new RequestContextData(UUID.randomUUID(), Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- calculateResults ---

    @Test
    void calculateResults_whenResultsAlreadyExist_throwsInvalidOperationException() {
        Competition competition = competitionWithResults();
        when(competitionService.getById(1L)).thenReturn(competition);

        assertThatThrownBy(() -> resultService.calculateResults(1L, List.of()))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void calculateResults_withValidData_setsFinishedAndPublishesEvent() {
        Competition competition = emptyCompetition(1L);
        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", null);
        Result result = new Result();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultMapper.toEntity(dto)).thenReturn(result);

        resultService.calculateResults(1L, List.of(dto));

        assertThat(competition.getStatus()).isEqualTo(CompetitionStatus.FINISHED);
        verify(eventPublisher).publishEvent(any(CompetitionResultsCalculatedEvent.class));
    }

    @Test
    void calculateResults_withNonExistentParticipantId_throwsResourceNotFoundException() {
        Competition competition = emptyCompetition(1L);
        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", 999L);
        Result result = new Result();

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultMapper.toEntity(dto)).thenReturn(result);
        when(participantRepository.findAllById(any())).thenReturn(List.of());

        assertThatThrownBy(() -> resultService.calculateResults(1L, List.of(dto)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void calculateResults_withParticipantFromDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = emptyCompetition(1L);
        Competition otherCompetition = emptyCompetition(2L);
        otherCompetition.setId(2L);

        Participant participant = new Participant();
        participant.setId(10L);
        participant.setCompetition(otherCompetition);

        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", 10L);
        Result result = new Result();
        result.setCompetition(competition);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultMapper.toEntity(dto)).thenReturn(result);
        when(participantRepository.findAllById(any())).thenReturn(List.of(participant));

        assertThatThrownBy(() -> resultService.calculateResults(1L, List.of(dto)))
                .isInstanceOf(InvalidOperationException.class);
    }

    // --- updateResult ---

    @Test
    void updateResult_withRemoveParticipant_setsParticipantNull() {
        Competition competition = emptyCompetition(1L);
        Result result = new Result();
        result.setCompetition(competition);

        ResultId id = new ResultId(1L, ParticipantPositionType.INDIVIDUAL, 1);
        ResultUpdateDTO dto = new ResultUpdateDTO(null, null, true);

        when(resultRepository.findById(id)).thenReturn(Optional.of(result));

        resultService.updateResult(id, dto);

        assertThat(result.getParticipant()).isNull();
        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void updateResult_withParticipantFromDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = emptyCompetition(1L);
        Competition otherCompetition = emptyCompetition(2L);

        Participant participant = new Participant();
        participant.setCompetition(otherCompetition);

        Result result = new Result();
        result.setCompetition(competition);

        ResultId id = new ResultId(1L, ParticipantPositionType.INDIVIDUAL, 1);
        ResultUpdateDTO dto = new ResultUpdateDTO(null, 99L, false);

        when(resultRepository.findById(id)).thenReturn(Optional.of(result));
        when(participantService.getById(99L)).thenReturn(participant);

        assertThatThrownBy(() -> resultService.updateResult(id, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    // --- getResults ---

    @Test
    void getResults_beforeDeadline_hidesPoints() {
        Result result = new Result();
        result.setPoints(100);
        ResultDTO dto = new ResultDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", 100, null);

        when(resultRepository.findAllByCompetitionId(1L)).thenReturn(List.of(result));
        when(resultMapper.toDTO(result)).thenReturn(dto);

        LocalDate beforeDeadline = LocalDate.of(LocalDate.now().getYear(), Month.JANUARY, 1);
        try (MockedStatic<LocalDate> dateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            dateMock.when(LocalDate::now).thenReturn(beforeDeadline);

            List<ResultDTO> results = resultService.getResults(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).points()).isEqualTo(-1);
        }
    }

    @Test
    void getResults_afterDeadline_showsRealPoints() {
        Result result = new Result();
        result.setPoints(50);
        ResultDTO dto = new ResultDTO(ParticipantPositionType.INDIVIDUAL, 2, "Escuela Y", 50, null);

        when(resultRepository.findAllByCompetitionId(1L)).thenReturn(List.of(result));
        when(resultMapper.toDTO(result)).thenReturn(dto);

        LocalDate afterDeadline = LocalDate.of(LocalDate.now().getYear(), Month.DECEMBER, 31);
        try (MockedStatic<LocalDate> dateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            dateMock.when(LocalDate::now).thenReturn(afterDeadline);

            List<ResultDTO> results = resultService.getResults(1L);

            assertThat(results).hasSize(1);
            assertThat(results.get(0).points()).isEqualTo(50);
        }
    }

    // --- helpers ---

    private Competition emptyCompetition(Long id) {
        Competition competition = new Competition();
        competition.setId(id);
        competition.setStatus(CompetitionStatus.ON_GOING);
        competition.setRegistrationStatus(RegistrationStatus.EXPIRED);
        return competition;
    }

    private Competition competitionWithResults() {
        Competition competition = emptyCompetition(1L);
        Result existing = new Result();
        existing.setCompetition(competition);
        List<Result> results = new ArrayList<>();
        results.add(existing);
        competition.addResults(results);
        return competition;
    }
}
