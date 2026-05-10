package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.ResultPointsCalculator;
import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultReorderDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import dev.santiescobares.ubesweb.competition.event.result.CompetitionResultUpdateEvent;
import dev.santiescobares.ubesweb.competition.mapper.ResultMapper;
import dev.santiescobares.ubesweb.competition.repository.ResultRepository;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final CompetitionService competitionService;
    private final ParticipantService participantService;

    private final ResultRepository resultRepository;

    private final ResultMapper resultMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public ResultDTO addResult(Long competitionId, ResultCreateDTO dto) {
        Competition competition = competitionService.getById(competitionId);

        if (competition.getStatus() != CompetitionStatus.FINISHED) {
            throw new InvalidOperationException("Results can only be added to finished competitions");
        }

        int nextPosition = resultRepository
                .findMaxPositionNumberByCompetitionIdAndPositionType(competitionId, dto.positionType())
                .map(max -> max + 1)
                .orElse(1);

        Result result = resultMapper.toEntity(dto);
        result.setCompetition(competition);
        result.setPositionNumber(nextPosition);
        result.setPoints(ResultPointsCalculator.calculatePoints(nextPosition));

        if (dto.participantId() != null) {
            Participant participant = participantService.getById(dto.participantId());
            if (!participant.getCompetition().getId().equals(competitionId)) {
                throw new InvalidOperationException("Can't add a participant from a different competition");
            }
            result.setParticipant(participant);
        }

        resultRepository.save(result);

        eventPublisher.publishEvent(new CompetitionResultUpdateEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                result
        ));

        return resultMapper.toDTO(result);
    }

    @Transactional
    public ResultDTO updateResult(Long resultId, ResultUpdateDTO dto) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_RESULT));

        resultMapper.updateFromDTO(result, dto);

        if (dto.removeParticipant()) {
            result.setParticipant(null);
        } else if (dto.participantId() != null) {
            Participant participant = participantService.getById(dto.participantId());
            if (!participant.getCompetition().getId().equals(result.getCompetition().getId())) {
                throw new InvalidOperationException("Can't add a participant from a different competition");
            }
            result.setParticipant(participant);
        }

        eventPublisher.publishEvent(new CompetitionResultUpdateEvent(
                RequestContextHolder.getCurrentSession().userId(),
                result.getCompetition(),
                result
        ));

        return resultMapper.toDTO(result);
    }

    @Transactional
    public void deleteResult(Long resultId) {
        Result result = resultRepository.findById(resultId)
                .orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_RESULT));
        resultRepository.delete(result);
    }

    @Transactional
    public void reorderResults(Long competitionId, ParticipantPositionType positionType, ResultReorderDTO dto) {
        List<Result> results = resultRepository.findAllByCompetitionIdAndPositionType(competitionId, positionType);

        Set<Long> existingIds = results.stream().map(Result::getId).collect(Collectors.toSet());
        Set<Long> requestedIds = dto.entries().stream().map(ResultReorderDTO.ResultOrderEntry::id).collect(Collectors.toSet());

        if (!existingIds.equals(requestedIds)) {
            throw new InvalidOperationException("Reorder entries must cover all results of the given position type");
        }

        Set<Integer> positions = dto.entries().stream()
                .map(ResultReorderDTO.ResultOrderEntry::positionNumber)
                .collect(Collectors.toSet());
        if (positions.size() != dto.entries().size()) {
            throw new InvalidOperationException("Position numbers must be unique");
        }

        Map<Long, Result> resultById = results.stream().collect(Collectors.toMap(Result::getId, Function.identity()));

        for (ResultReorderDTO.ResultOrderEntry entry : dto.entries()) {
            Result result = resultById.get(entry.id());
            result.setPositionNumber(entry.positionNumber());
            result.setPoints(ResultPointsCalculator.calculatePoints(entry.positionNumber()));
        }

        resultRepository.saveAll(results);
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> findResultDTOs(Long competitionId) {
        return applyPointsVisibility(resultRepository.findAllByCompetitionId(competitionId));
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> findResultDTOsByType(Long competitionId, ParticipantPositionType positionType) {
        return applyPointsVisibility(resultRepository.findAllByCompetitionIdAndPositionType(competitionId, positionType));
    }

    private List<ResultDTO> applyPointsVisibility(List<Result> results) {
        boolean hidePoints = LocalDate.now().isBefore(Global.COMPETITION_RESULTS_DEADLINE());
        return results.stream()
                .map(result -> {
                    ResultDTO dto = resultMapper.toDTO(result);
                    return hidePoints ? new ResultDTO(dto.id(), dto.positionType(), dto.positionNumber(), dto.name(), -1, dto.participant()) : dto;
                })
                .toList();
    }
}
