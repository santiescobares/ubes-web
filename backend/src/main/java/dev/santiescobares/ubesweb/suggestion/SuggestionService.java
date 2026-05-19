package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionCreateDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionsByDateDTO;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionCreateEvent;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionUpdateEvent;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionVoteEvent;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionRepository;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionVoteRepository;
import dev.santiescobares.ubesweb.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageImpl;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SuggestionService {

    private final UserService userService;

    private final SuggestionRepository suggestionRepository;
    private final SuggestionVoteRepository suggestionVoteRepository;

    private final SuggestionMapper suggestionMapper;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public SuggestionDTO createSuggestion(SuggestionCreateDTO dto) {
        Suggestion suggestion = suggestionMapper.toEntity(dto);
        suggestion.setCreatedBy(userService.getCurrentUser());

        suggestionRepository.save(suggestion);

        eventPublisher.publishEvent(new SuggestionCreateEvent(RequestContextHolder.getCurrentSession().userId(), suggestion));

        return suggestionMapper.toDTO(suggestion, 0, 0, null);
    }

    @Transactional
    public void voteSuggestion(Long id, boolean inFavor) {
        Suggestion suggestion = getById(id);
        if (suggestion.isHidden()) {
            throw new InvalidOperationException("Can't vote on a hidden suggestion");
        }
        if (suggestion.getCreatedBy().getId().equals(RequestContextHolder.getCurrentSession().userId())) {
            throw new InvalidOperationException("You can't vote your own suggestion");
        }

        if (suggestionVoteRepository.existsBySuggestionIdAndVoterId(id, RequestContextHolder.getCurrentSession().userId())) {
            throw new InvalidOperationException("You already voted on that suggestion");
        }

        SuggestionVote vote = new SuggestionVote();
        vote.setSuggestion(suggestion);
        vote.setVoter(userService.getCurrentUser());
        vote.setTimestamp(Instant.now());
        vote.setInFavor(inFavor);

        suggestion.addVote(vote);

        eventPublisher.publishEvent(new SuggestionVoteEvent(RequestContextHolder.getCurrentSession().userId(), suggestion));
    }

    @Transactional
    public void hideSuggestion(Long id) {
        Suggestion suggestion = getById(id);
        if (suggestion.isHidden()) {
            throw new InvalidOperationException("Suggestion is already hidden");
        }

        suggestion.hide(userService.getCurrentUser());

        eventPublisher.publishEvent(new SuggestionUpdateEvent(RequestContextHolder.getCurrentSession().userId(), suggestion));
    }

    @Transactional
    public void unhideSuggestion(Long id) {
        Suggestion suggestion = getById(id);
        if (!suggestion.isHidden()) {
            throw new InvalidOperationException("Suggestion is not hidden");
        }

        suggestion.unhide();

        eventPublisher.publishEvent(new SuggestionUpdateEvent(RequestContextHolder.getCurrentSession().userId(), suggestion));
    }

    @Transactional(readOnly = true)
    public Page<SuggestionDTO> getSuggestionDTOs(Pageable pageable) {
        Page<Suggestion> suggestions;

        RequestContextData contextData = RequestContextHolder.getCurrentSession();
        boolean isAuthority = contextData != null && contextData.role().getAuthority() == RoleAuthority.EXECUTIVE;

        if (isAuthority) {
            suggestions = suggestionRepository.findAll(pageable);
        } else {
            suggestions = suggestionRepository.findAllByHiddenAtIsNull(pageable);
        }

        if (suggestions.isEmpty()) {
            return Page.empty(pageable);
        }

        List<Long> suggestionIds = suggestions.getContent().stream().map(Suggestion::getId).toList();

        List<Object[]> voteStats = suggestionVoteRepository.getVoteStatsBySuggestionIds(suggestionIds);
        Map<Long, VoteStats> statsMap = new HashMap<>();
        for (Object[] stat : voteStats) {
            statsMap.put((Long) stat[0], new VoteStats((Long) stat[1], (Long) stat[2]));
        }

        Map<Long, Boolean> userVoteMap = buildUserVoteMap(contextData, suggestionIds);

        return suggestions.map(suggestion -> {
            VoteStats stat = statsMap.getOrDefault(suggestion.getId(), new VoteStats(0L, 0L));
            Boolean userVote = userVoteMap.get(suggestion.getId());
            SuggestionDTO dto = suggestionMapper.toDTO(suggestion, stat.totalVotes().intValue(), stat.votesInFavor().intValue(), userVote);

            if (suggestion.isAnonymized() && !isAuthority) {
                return new SuggestionDTO(dto.id(), dto.createdAt(), dto.updatedAt(), null, dto.content(), dto.anonymized(), dto.totalVotes(), dto.votesInFavor(), dto.userVote(), dto.hidden());
            }
            return dto;
        });
    }

    @Transactional(readOnly = true)
    public Page<SuggestionsByDateDTO> getSuggestionsByDate(Pageable pageable) {
        RequestContextData contextData = RequestContextHolder.getCurrentSession();
        boolean isAuthority = contextData != null && contextData.role().getAuthority() == RoleAuthority.EXECUTIVE;
        boolean includeHidden = isAuthority;

        int offset = (int) pageable.getOffset();
        int limit = pageable.getPageSize();

        List<LocalDate> dates = suggestionRepository.findDistinctDatesPaged(offset, limit, includeHidden);
        if (dates.isEmpty()) {
            return Page.empty(pageable);
        }

        long totalDates = suggestionRepository.countDistinctDates(includeHidden);

        List<Suggestion> suggestions = suggestionRepository.findAllByDates(dates, includeHidden);
        List<Long> suggestionIds = suggestions.stream().map(Suggestion::getId).toList();

        List<Object[]> voteStats = suggestionVoteRepository.getVoteStatsBySuggestionIds(suggestionIds);
        Map<Long, VoteStats> statsMap = new HashMap<>();
        for (Object[] stat : voteStats) {
            statsMap.put((Long) stat[0], new VoteStats((Long) stat[1], (Long) stat[2]));
        }

        Map<Long, Boolean> userVoteMap = buildUserVoteMap(contextData, suggestionIds);

        Map<LocalDate, List<SuggestionDTO>> grouped = new java.util.LinkedHashMap<>();
        for (LocalDate date : dates) {
            grouped.put(date, new ArrayList<>());
        }

        for (Suggestion suggestion : suggestions) {
            LocalDate day = suggestion.getCreatedAt().atZone(java.time.ZoneOffset.UTC).toLocalDate();
            List<SuggestionDTO> group = grouped.get(day);
            if (group == null) continue;

            VoteStats stat = statsMap.getOrDefault(suggestion.getId(), new VoteStats(0L, 0L));
            Boolean userVote = userVoteMap.get(suggestion.getId());
            SuggestionDTO dto = suggestionMapper.toDTO(suggestion, stat.totalVotes().intValue(), stat.votesInFavor().intValue(), userVote);

            if (suggestion.isAnonymized() && !isAuthority) {
                dto = new SuggestionDTO(dto.id(), dto.createdAt(), dto.updatedAt(), null, dto.content(), dto.anonymized(), dto.totalVotes(), dto.votesInFavor(), dto.userVote(), dto.hidden());
            }
            group.add(dto);
        }

        List<SuggestionsByDateDTO> content = dates.stream()
                .map(date -> new SuggestionsByDateDTO(date, grouped.get(date)))
                .toList();

        return new PageImpl<>(content, pageable, totalDates);
    }

    private Map<Long, Boolean> buildUserVoteMap(RequestContextData contextData, List<Long> suggestionIds) {
        if (contextData == null || suggestionIds.isEmpty()) {
            return Map.of();
        }
        UUID voterId = contextData.userId();
        Map<Long, Boolean> map = new HashMap<>();
        for (Object[] row : suggestionVoteRepository.findUserVotesBySuggestionIds(voterId, suggestionIds)) {
            map.put((Long) row[0], (Boolean) row[1]);
        }
        return map;
    }

    private Suggestion getById(Long id) {
        return suggestionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.SUGGESTION));
    }

    private record VoteStats(Long totalVotes, Long votesInFavor) {}
}
