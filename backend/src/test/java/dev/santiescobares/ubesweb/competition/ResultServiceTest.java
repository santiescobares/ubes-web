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
import dev.santiescobares.ubesweb.competition.mapper.ResultMapper;
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
import java.time.LocalDateTime;
import java.time.Month;
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

    // --- addResult ---

    @Test
    void addResult_whenCompetitionNotFinished_throwsInvalidOperationException() {
        Competition competition = competition(1L, CompetitionStatus.ONGOING);
        when(competitionService.getById(1L)).thenReturn(competition);

        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", null);

        assertThatThrownBy(() -> resultService.addResult(1L, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addResult_savesResultAndPublishesEvent() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", null);
        Result result = new Result();
        result.setCompetition(competition);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultMapper.toEntity(dto)).thenReturn(result);
        when(resultMapper.toDTO(result)).thenReturn(mock(ResultDTO.class));

        resultService.addResult(1L, dto);

        verify(resultRepository).save(result);
        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void addResult_withParticipantFromDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        Competition other = competition(2L, CompetitionStatus.FINISHED);

        Participant participant = new Participant();
        participant.setCompetition(other);

        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", 10L);
        Result result = new Result();
        result.setCompetition(competition);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultMapper.toEntity(dto)).thenReturn(result);
        when(participantService.getById(10L)).thenReturn(participant);

        assertThatThrownBy(() -> resultService.addResult(1L, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    // --- updateResult ---

    @Test
    void updateResult_withRemoveParticipant_setsParticipantNull() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        Result result = new Result();
        result.setCompetition(competition);

        ResultUpdateDTO dto = new ResultUpdateDTO(null, null, true);

        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));
        when(resultMapper.toDTO(result)).thenReturn(mock(ResultDTO.class));

        resultService.updateResult(1L, dto);

        assertThat(result.getParticipant()).isNull();
        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void updateResult_withParticipantFromDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        Competition other = competition(2L, CompetitionStatus.FINISHED);

        Participant participant = new Participant();
        participant.setCompetition(other);

        Result result = new Result();
        result.setCompetition(competition);

        ResultUpdateDTO dto = new ResultUpdateDTO(null, 99L, false);

        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));
        when(participantService.getById(99L)).thenReturn(participant);

        assertThatThrownBy(() -> resultService.updateResult(1L, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void updateResult_notFound_throwsResourceNotFoundException() {
        when(resultRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resultService.updateResult(99L, new ResultUpdateDTO(null, null, false)))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- deleteResult ---

    @Test
    void deleteResult_deletesResult() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        Result result = new Result();
        result.setCompetition(competition);
        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));

        resultService.deleteResult(1L);

        verify(resultRepository).delete(result);
    }

    // --- 7-day modification window ---

    @Test
    void updateResult_withinWindow_day1_allows() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED, LocalDateTime.now().minusDays(1));
        Result result = new Result();
        result.setCompetition(competition);

        ResultUpdateDTO dto = new ResultUpdateDTO(null, null, true);

        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));
        when(resultMapper.toDTO(result)).thenReturn(mock(ResultDTO.class));

        resultService.updateResult(1L, dto);

        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void updateResult_withinWindow_justBeforeExpiry_allows() {
        LocalDateTime endingDate = LocalDateTime.now().minusDays(7).plusSeconds(60);
        Competition competition = competition(1L, CompetitionStatus.FINISHED, endingDate);
        Result result = new Result();
        result.setCompetition(competition);

        ResultUpdateDTO dto = new ResultUpdateDTO(null, null, true);

        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));
        when(resultMapper.toDTO(result)).thenReturn(mock(ResultDTO.class));

        resultService.updateResult(1L, dto);

        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void updateResult_outsideWindow_throwsInvalidOperationException() {
        LocalDateTime endingDate = LocalDateTime.now().minusDays(8);
        Competition competition = competition(1L, CompetitionStatus.FINISHED, endingDate);
        Result result = new Result();
        result.setCompetition(competition);

        ResultUpdateDTO dto = new ResultUpdateDTO(null, null, true);

        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));

        assertThatThrownBy(() -> resultService.updateResult(1L, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    // --- findResultDTOs ---

    @Test
    void findResultDTOs_beforeDeadline_hidesPoints() {
        Result result = new Result();
        ResultDTO dto = new ResultDTO(1L, ParticipantPositionType.INDIVIDUAL, 1, "Escuela X", 100, null);

        when(resultRepository.findAllByCompetitionId(1L)).thenReturn(List.of(result));
        when(resultMapper.toDTO(result)).thenReturn(dto);

        LocalDate beforeDeadline = LocalDate.of(LocalDate.now().getYear(), Month.JANUARY, 1);
        try (MockedStatic<LocalDate> dateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            dateMock.when(LocalDate::now).thenReturn(beforeDeadline);

            List<ResultDTO> results = resultService.findResultDTOs(1L);

            assertThat(results.get(0).points()).isEqualTo(-1);
        }
    }

    @Test
    void findResultDTOs_afterDeadline_showsRealPoints() {
        Result result = new Result();
        ResultDTO dto = new ResultDTO(2L, ParticipantPositionType.INDIVIDUAL, 2, "Escuela Y", 50, null);

        when(resultRepository.findAllByCompetitionId(1L)).thenReturn(List.of(result));
        when(resultMapper.toDTO(result)).thenReturn(dto);

        LocalDate afterDeadline = LocalDate.of(LocalDate.now().getYear(), Month.DECEMBER, 31);
        try (MockedStatic<LocalDate> dateMock = mockStatic(LocalDate.class, CALLS_REAL_METHODS)) {
            dateMock.when(LocalDate::now).thenReturn(afterDeadline);

            List<ResultDTO> results = resultService.findResultDTOs(1L);

            assertThat(results.get(0).points()).isEqualTo(50);
        }
    }

    // --- helpers ---

    private Competition competition(Long id, CompetitionStatus status) {
        return competition(id, status, LocalDateTime.now().minusDays(1));
    }

    private Competition competition(Long id, CompetitionStatus status, LocalDateTime endingDate) {
        Competition competition = new Competition();
        competition.setId(id);
        competition.setStatus(status);
        competition.setRegistrationStatus(RegistrationStatus.EXPIRED);
        competition.setEndingDate(endingDate);
        return competition;
    }

    private Result result(Long id, ParticipantPositionType positionType, int positionNumber) {
        Result result = new Result();
        result.setId(id);
        result.setPositionType(positionType);
        result.setPositionNumber(positionNumber);
        return result;
    }
}
