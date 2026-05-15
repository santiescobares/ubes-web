package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.ResultPointsCalculator;
import dev.santiescobares.ubesweb.competition.dto.result.ResultBulkUpsertDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
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
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
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

        validateCompetitionStatus(competition);

        Result result = resultMapper.toEntity(dto);
        result.setCompetition(competition);
        result.setPoints(ResultPointsCalculator.calculatePoints(dto.positionNumber()));

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
    public ResultDTO updateResult(Long id, ResultUpdateDTO dto) {
        Result result = getById(id);

        validateCompetitionStatus(result.getCompetition());

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
    public List<ResultDTO> upsertResultsBulk(Long competitionId, ResultBulkUpsertDTO dto) {
        Competition competition = competitionService.getById(competitionId);
        validateCompetitionStatus(competition);
        validateNoDuplicates(competitionId, dto);

        List<Long> existingIds = dto.items().stream()
                .filter(item -> item.id() != null)
                .map(ResultBulkUpsertDTO.Item::id)
                .toList();

        Map<Long, Result> existingResults = resultRepository.findAllByIdIn(existingIds).stream()
                .collect(Collectors.toMap(Result::getId, r -> r));

        List<Result> toSave = new ArrayList<>();

        for (ResultBulkUpsertDTO.Item item : dto.items()) {
            Result result;
            if (item.id() != null) {
                result = existingResults.get(item.id());
                if (result == null || !result.getCompetition().getId().equals(competitionId)) {
                    throw new InvalidOperationException("Result does not belong to this competition");
                }
                result.setName(item.name());
                result.setPositionNumber(item.positionNumber());
            } else {
                result = new Result();
                result.setCompetition(competition);
                result.setPositionType(item.positionType());
                result.setName(item.name());
                result.setPositionNumber(item.positionNumber());
            }

            result.setPoints(ResultPointsCalculator.calculatePoints(item.positionNumber()));

            if (item.participantId() != null) {
                Participant participant = participantService.getById(item.participantId());
                if (!participant.getCompetition().getId().equals(competitionId)) {
                    throw new InvalidOperationException("Can't add a participant from a different competition");
                }
                result.setParticipant(participant);
                result.setSchool(null);
            } else {
                result.setParticipant(null);
                result.setSchool(item.school());
            }

            toSave.add(result);
        }

        List<Result> saved = resultRepository.saveAll(toSave);

        saved.forEach(result -> eventPublisher.publishEvent(new CompetitionResultUpdateEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                result
        )));

        return applyPointsVisibility(saved);
    }

    @Transactional
    public void deleteResult(Long id) {
        Result result = getById(id);

        validateCompetitionStatus(result.getCompetition());

        Long competitionId = result.getCompetition().getId();
        ParticipantPositionType positionType = result.getPositionType();
        int deletedPosition = result.getPositionNumber();

        resultRepository.delete(result);
        resultRepository.flush();

        List<Result> toReorder = resultRepository
                .findAllByCompetitionIdAndPositionTypeAndPositionNumberGreaterThan(competitionId, positionType, deletedPosition);

        for (Result r : toReorder) {
            r.setPositionNumber(r.getPositionNumber() - 1);
            r.setPoints(ResultPointsCalculator.calculatePoints(r.getPositionNumber()));
        }

        resultRepository.saveAll(toReorder);
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> findResultDTOs(Long competitionId) {
        return applyPointsVisibility(resultRepository.findAllByCompetitionId(competitionId));
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> findResultDTOsByType(Long competitionId, ParticipantPositionType positionType) {
        return applyPointsVisibility(resultRepository.findAllByCompetitionIdAndPositionType(competitionId, positionType));
    }

    private Result getById(Long id) {
        return resultRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_RESULT));
    }

    private void validateNoDuplicates(Long competitionId, ResultBulkUpsertDTO dto) {
        if (dto.items().isEmpty()) return;

        ParticipantPositionType positionType = dto.items().getFirst().positionType();

        List<Long> updatingIds = dto.items().stream()
                .filter(item -> item.id() != null)
                .map(ResultBulkUpsertDTO.Item::id)
                .toList();

        List<Result> existing = resultRepository
                .findAllByCompetitionIdAndPositionType(competitionId, positionType)
                .stream()
                .filter(r -> !updatingIds.contains(r.getId()))
                .toList();

        if (positionType == ParticipantPositionType.SCHOOL || positionType == ParticipantPositionType.SUPPORTER) {
            Set<String> names = existing.stream()
                    .map(Result::getName).filter(Objects::nonNull)
                    .collect(Collectors.toCollection(HashSet::new));
            for (ResultBulkUpsertDTO.Item item : dto.items()) {
                if (!names.add(item.name())) {
                    throw new InvalidOperationException("Duplicate school entry: " + item.name());
                }
            }
        } else if (positionType == ParticipantPositionType.INDIVIDUAL) {
            Set<Long> participantIds = existing.stream()
                    .filter(r -> r.getParticipant() != null)
                    .map(r -> r.getParticipant().getId())
                    .collect(Collectors.toCollection(HashSet::new));
            Set<String> freeNames = existing.stream()
                    .filter(r -> r.getParticipant() == null)
                    .map(Result::getName).filter(Objects::nonNull)
                    .collect(Collectors.toCollection(HashSet::new));
            for (ResultBulkUpsertDTO.Item item : dto.items()) {
                if (item.participantId() != null) {
                    if (!participantIds.add(item.participantId())) {
                        throw new InvalidOperationException("Duplicate participant in results: " + item.participantId());
                    }
                } else {
                    if (!freeNames.add(item.name())) {
                        throw new InvalidOperationException("Duplicate free-text name in results: " + item.name());
                    }
                }
            }
        }
    }

    private void validateCompetitionStatus(Competition competition) {
        if (competition.getStatus() != CompetitionStatus.FINISHED) {
            throw new InvalidOperationException("Results can only be added to finished competitions");
        }
        if (LocalDateTime.now().isAfter(competition.getEndingDate().plusDays(7))) {
            throw new InvalidOperationException("The period for modifying that competition results already expired");
        }
    }

    private List<ResultDTO> applyPointsVisibility(List<Result> results) {
        boolean hidePoints = LocalDate.now().isBefore(Global.COMPETITION_RESULTS_DEADLINE());
        return results.stream()
                .map(result -> {
                    ResultDTO dto = resultMapper.toDTO(result);
                    return hidePoints ? new ResultDTO(dto.id(), dto.positionType(), dto.positionNumber(), dto.name(), -1, dto.participant(), dto.school()) : dto;
                })
                .toList();
    }
}
