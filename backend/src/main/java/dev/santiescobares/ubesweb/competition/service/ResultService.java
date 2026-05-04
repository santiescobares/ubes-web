package dev.santiescobares.ubesweb.competition.service;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.competition.ResultPointsCalculator;
import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.event.result.CompetitionResultUpdateEvent;
import dev.santiescobares.ubesweb.competition.event.result.CompetitionResultsCalculatedEvent;
import dev.santiescobares.ubesweb.competition.id.ResultId;
import dev.santiescobares.ubesweb.competition.mapper.ResultMapper;
import dev.santiescobares.ubesweb.competition.repository.ParticipantRepository;
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
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ResultService {

    private final CompetitionService competitionService;
    private final ParticipantService participantService;

    private final ResultRepository resultRepository;
    private final ParticipantRepository participantRepository;

    private final ResultMapper resultMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public void calculateResults(Long competitionId, List<ResultCreateDTO> results) {
        Competition competition = competitionService.getById(competitionId);
        if (!competition.getResults().isEmpty()) {
            throw new InvalidOperationException("Results were already calculated for that competition");
        }

        competition.setStatus(CompetitionStatus.FINISHED);

        List<Result> resultsList = new ArrayList<>();

        Set<Long> participantIds = results.stream()
                .map(ResultCreateDTO::participantId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
        Map<Long, Participant> participantsMap = participantIds.isEmpty()
                ? Map.of()
                : participantRepository.findAllById(participantIds)
                        .stream()
                        .collect(Collectors.toMap(Participant::getId, Function.identity()));

        for (ResultCreateDTO dto : results) {
            Result result = resultMapper.toEntity(dto);
            result.setId(new ResultId(competitionId, dto.positionType(), dto.positionNumber()));
            result.setPoints(ResultPointsCalculator.calculatePoints(dto.positionNumber()));

            if (dto.participantId() != null) {
                Participant participant = participantsMap.get(dto.participantId());

                if (participant == null) {
                    throw new ResourceNotFoundException(ResourceType.COMPETITION_PARTICIPANT);
                }
                if (!participant.getCompetition().equals(result.getCompetition())) {
                    throw new InvalidOperationException("Can't add a participant from a different competition");
                }

                result.setParticipant(participant);
            }

            resultsList.add(result);
        }

        competition.addResults(resultsList);

        eventPublisher.publishEvent(new CompetitionResultsCalculatedEvent(
                RequestContextHolder.getCurrentSession().userId(),
                competition,
                resultsList
        ));
    }

    @Transactional
    public void updateResult(ResultId id, ResultUpdateDTO dto) {
        Result result = resultRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.COMPETITION_RESULT));

        resultMapper.updateFromDTO(result, dto);

        if (dto.removeParticipant()) {
            result.setParticipant(null);
        } else {
            if (dto.participantId() != null) {
                Participant participant = participantService.getById(dto.participantId());

                if (!participant.getCompetition().equals(result.getCompetition())) {
                    throw new InvalidOperationException("Can't add a participant from a different competition");
                }

                result.setParticipant(participant);
            }
        }

        eventPublisher.publishEvent(new CompetitionResultUpdateEvent(
                RequestContextHolder.getCurrentSession().userId(),
                result.getCompetition(),
                result
        ));
    }

    @Transactional(readOnly = true)
    public List<ResultDTO> getResults(Long competitionId) {
        List<Result> results = resultRepository.findAllByCompetitionId(competitionId);
        boolean hidePoints = LocalDate.now().isBefore(Global.COMPETITION_RESULTS_DEADLINE());

        return results.stream()
                .map(result -> {
                    ResultDTO dto = resultMapper.toDTO(result);
                    if (hidePoints) {
                        return new ResultDTO(dto.positionType(), dto.positionNumber(), dto.name(), -1, dto.participant());
                    }
                    return dto;
                })
                .toList();
    }
}
