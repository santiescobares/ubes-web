package dev.santiescobares.ubesweb.service;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.event.Event;
import dev.santiescobares.ubesweb.event.EventRepository;
import dev.santiescobares.ubesweb.model.location.Location;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import dev.santiescobares.ubesweb.post.PostMapper;
import dev.santiescobares.ubesweb.post.PostRepository;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.punishment.PunishmentRepository;
import dev.santiescobares.ubesweb.service.dto.*;
import dev.santiescobares.ubesweb.suggestion.Suggestion;
import dev.santiescobares.ubesweb.suggestion.SuggestionMapper;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionRepository;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionVoteRepository;
import dev.santiescobares.ubesweb.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AnalyticsService {

    private final UserRepository userRepository;
    private final PunishmentRepository punishmentRepository;
    private final SuggestionRepository suggestionRepository;
    private final SuggestionVoteRepository suggestionVoteRepository;
    private final PostRepository postRepository;
    private final EventRepository eventRepository;
    private final CompetitionRepository competitionRepository;

    private final PostMapper postMapper;
    private final SuggestionMapper suggestionMapper;

    public DashboardDataDTO getDashboardData() {
        Instant now = Instant.now();
        Instant weekAgo = now.minus(7, ChronoUnit.DAYS);
        LocalDateTime nowLdt = LocalDateTime.now();
        LocalDateTime weekAgoLdt = nowLdt.minusDays(7);

        return new DashboardDataDTO(
                buildCounts(now, weekAgo, nowLdt, weekAgoLdt),
                buildLastPost(),
                buildUpcomingItems(nowLdt),
                buildLatestSuggestions()
        );
    }

    private DashboardCountsDTO buildCounts(Instant now, Instant weekAgo, LocalDateTime nowLdt, LocalDateTime weekAgoLdt) {
        long totalUsers = userRepository.count();
        long newUsers = userRepository.countByCreatedAtAfter(weekAgo);

        long currentPunishments = punishmentRepository.countActivePunishments(nowLdt);
        long weekAgoPunishments = punishmentRepository.countActivePunishmentsAsOf(weekAgo, weekAgoLdt);
        long punishmentDelta = currentPunishments - weekAgoPunishments;

        long totalSuggestions = suggestionRepository.count();
        long newSuggestions = suggestionRepository.countByCreatedAtAfter(weekAgo);

        return new DashboardCountsDTO(
                new CountDeltaDTO(totalUsers, newUsers),
                new CountDeltaDTO(currentPunishments, punishmentDelta),
                new CountDeltaDTO(totalSuggestions, newSuggestions)
        );
    }

    private PostDTO buildLastPost() {
        return postRepository.findTopByOrderByCreatedAtDesc()
                .map(postMapper::toDTO)
                .orElse(null);
    }

    private List<UpcomingItemDTO> buildUpcomingItems(LocalDateTime now) {
        List<Event> events = eventRepository.findUpcomingEvents(now, PageRequest.of(0, 3));
        List<Competition> competitions = competitionRepository.findUpcomingCompetitions(now, PageRequest.of(0, 3));

        List<UpcomingItemDTO> items = new ArrayList<>();

        for (Event event : events) {
            items.add(new UpcomingItemDTO(
                    "EVENT",
                    String.valueOf(event.getId()),
                    event.getType(),
                    event.getName(),
                    toLocationDTO(event.getLocation()),
                    event.getStartingDate(),
                    event.getEndingDate(),
                    !now.isBefore(event.getStartingDate()) && !now.isAfter(event.getEndingDate())
            ));
        }

        for (Competition competition : competitions) {
            items.add(new UpcomingItemDTO(
                    "COMPETITION",
                    String.valueOf(competition.getId()),
                    competition.getType(),
                    competition.getName(),
                    toLocationDTO(competition.getLocation()),
                    competition.getStartingDate(),
                    competition.getEndingDate(),
                    competition.getStatus() == CompetitionStatus.ONGOING
            ));
        }

        items.sort(Comparator
                .comparing((UpcomingItemDTO i) -> !i.active())
                .thenComparing(UpcomingItemDTO::startingDate));

        return items.stream().limit(3).toList();
    }

    private List<SuggestionDTO> buildLatestSuggestions() {
        List<Suggestion> suggestions = suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc();

        if (suggestions.isEmpty()) {
            return List.of();
        }

        List<Object[]> voteStats = suggestionVoteRepository.getVoteStatsBySuggestionIds(
                suggestions.stream().map(Suggestion::getId).toList()
        );

        Map<Long, VoteStats> statsMap = new HashMap<>();
        for (Object[] stat : voteStats) {
            statsMap.put((Long) stat[0], new VoteStats((Long) stat[1], (Long) stat[2]));
        }

        return suggestions.stream()
                .map(suggestion -> {
                    VoteStats stat = statsMap.getOrDefault(suggestion.getId(), new VoteStats(0L, 0L));
                    return suggestionMapper.toDTO(suggestion, stat.totalVotes().intValue(), stat.votesInFavor().intValue());
                })
                .toList();
    }

    private LocationDTO toLocationDTO(Location location) {
        if (location == null || location.getName() == null) return null;
        return new LocationDTO(location.getName(), location.getLatitude(), location.getLongitude());
    }

    private record VoteStats(Long totalVotes, Long votesInFavor) {}
}
