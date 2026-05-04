package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionCreateDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionCreateEvent;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionUpdateEvent;
import dev.santiescobares.ubesweb.suggestion.event.SuggestionVoteEvent;
import dev.santiescobares.ubesweb.suggestion.id.SuggestionVoteId;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionRepository;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionVoteRepository;
import dev.santiescobares.ubesweb.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

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

        return suggestionMapper.toDTO(suggestion, 0, 0);
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

        SuggestionVoteId voteId = new SuggestionVoteId(id, RequestContextHolder.getCurrentSession().userId());
        if (suggestionVoteRepository.existsById(voteId)) {
            throw new InvalidOperationException("You already voted on that suggestion");
        }

        SuggestionVote vote = new SuggestionVote();
        vote.setId(voteId);
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

        List<Object[]> voteStats = suggestionVoteRepository.getVoteStatsBySuggestionIds(suggestions.getContent()
                .stream()
                .map(Suggestion::getId)
                .toList());

        Map<Long, VoteStats> statsMap = new HashMap<>();
        for (Object[] stat : voteStats) {
            statsMap.put((Long) stat[0], new VoteStats((Long) stat[1], (Long) stat[2]));
        }

        return suggestions.map(suggestion -> {
            VoteStats stat = statsMap.getOrDefault(suggestion.getId(), new VoteStats(0L, 0L));
            SuggestionDTO dto = suggestionMapper.toDTO(suggestion, stat.totalVotes().intValue(), stat.votesInFavor().intValue());

            if (suggestion.isAnonymized() && !isAuthority) {
                return new SuggestionDTO(dto.id(), dto.createdAt(), dto.updatedAt(), null, dto.content(), dto.totalVotes(), dto.votesInFavor());
            }
            return dto;
        });
    }

    private Suggestion getById(Long id) {
        return suggestionRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.SUGGESTION));
    }

    private record VoteStats(Long totalVotes, Long votesInFavor) {}
}
