package dev.santiescobares.ubesweb.competition;

import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultReorderDTO;
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
        Competition competition = competition(1L, CompetitionStatus.ON_GOING);
        when(competitionService.getById(1L)).thenReturn(competition);

        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, "Escuela X", null);

        assertThatThrownBy(() -> resultService.addResult(1L, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void addResult_autoAssignsPositionNumber() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, "Escuela X", null);
        Result result = new Result();
        result.setCompetition(competition);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultRepository.findMaxPositionNumberByCompetitionIdAndPositionType(1L, ParticipantPositionType.INDIVIDUAL))
                .thenReturn(Optional.of(2));
        when(resultMapper.toEntity(dto)).thenReturn(result);
        when(resultMapper.toDTO(result)).thenReturn(mock(ResultDTO.class));

        resultService.addResult(1L, dto);

        assertThat(result.getPositionNumber()).isEqualTo(3);
        verify(resultRepository).save(result);
        verify(eventPublisher).publishEvent(any(CompetitionResultUpdateEvent.class));
    }

    @Test
    void addResult_withParticipantFromDifferentCompetition_throwsInvalidOperationException() {
        Competition competition = competition(1L, CompetitionStatus.FINISHED);
        Competition other = competition(2L, CompetitionStatus.FINISHED);

        Participant participant = new Participant();
        participant.setCompetition(other);

        ResultCreateDTO dto = new ResultCreateDTO(ParticipantPositionType.INDIVIDUAL, "Escuela X", 10L);
        Result result = new Result();
        result.setCompetition(competition);

        when(competitionService.getById(1L)).thenReturn(competition);
        when(resultRepository.findMaxPositionNumberByCompetitionIdAndPositionType(any(), any()))
                .thenReturn(Optional.empty());
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
        Result result = new Result();
        when(resultRepository.findById(1L)).thenReturn(Optional.of(result));

        resultService.deleteResult(1L);

        verify(resultRepository).delete(result);
    }

    // --- reorderResults ---

    @Test
    void reorderResults_withMismatchedIds_throwsInvalidOperationException() {
        Result r1 = result(1L, ParticipantPositionType.INDIVIDUAL, 1);
        Result r2 = result(2L, ParticipantPositionType.INDIVIDUAL, 2);

        when(resultRepository.findAllByCompetitionIdAndPositionType(1L, ParticipantPositionType.INDIVIDUAL))
                .thenReturn(List.of(r1, r2));

        ResultReorderDTO dto = new ResultReorderDTO(List.of(
                new ResultReorderDTO.ResultOrderEntry(1L, 2),
                new ResultReorderDTO.ResultOrderEntry(99L, 1) // id 99 no existe
        ));

        assertThatThrownBy(() -> resultService.reorderResults(1L, ParticipantPositionType.INDIVIDUAL, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void reorderResults_withDuplicatePositions_throwsInvalidOperationException() {
        Result r1 = result(1L, ParticipantPositionType.INDIVIDUAL, 1);
        Result r2 = result(2L, ParticipantPositionType.INDIVIDUAL, 2);

        when(resultRepository.findAllByCompetitionIdAndPositionType(1L, ParticipantPositionType.INDIVIDUAL))
                .thenReturn(List.of(r1, r2));

        ResultReorderDTO dto = new ResultReorderDTO(List.of(
                new ResultReorderDTO.ResultOrderEntry(1L, 1),
                new ResultReorderDTO.ResultOrderEntry(2L, 1) // duplicado
        ));

        assertThatThrownBy(() -> resultService.reorderResults(1L, ParticipantPositionType.INDIVIDUAL, dto))
                .isInstanceOf(InvalidOperationException.class);
    }

    @Test
    void reorderResults_valid_updatesPositions() {
        Result r1 = result(1L, ParticipantPositionType.INDIVIDUAL, 1);
        Result r2 = result(2L, ParticipantPositionType.INDIVIDUAL, 2);

        when(resultRepository.findAllByCompetitionIdAndPositionType(1L, ParticipantPositionType.INDIVIDUAL))
                .thenReturn(List.of(r1, r2));

        ResultReorderDTO dto = new ResultReorderDTO(List.of(
                new ResultReorderDTO.ResultOrderEntry(1L, 2),
                new ResultReorderDTO.ResultOrderEntry(2L, 1)
        ));

        resultService.reorderResults(1L, ParticipantPositionType.INDIVIDUAL, dto);

        assertThat(r1.getPositionNumber()).isEqualTo(2);
        assertThat(r2.getPositionNumber()).isEqualTo(1);
        verify(resultRepository).saveAll(any());
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
        Competition competition = new Competition();
        competition.setId(id);
        competition.setStatus(status);
        competition.setRegistrationStatus(RegistrationStatus.EXPIRED);
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
