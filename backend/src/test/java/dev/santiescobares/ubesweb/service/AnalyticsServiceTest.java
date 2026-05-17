package dev.santiescobares.ubesweb.service;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.enums.CompetitionStatus;
import dev.santiescobares.ubesweb.competition.repository.CompetitionRepository;
import dev.santiescobares.ubesweb.event.Event;
import dev.santiescobares.ubesweb.event.EventRepository;
import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.post.Post;
import dev.santiescobares.ubesweb.post.PostMapper;
import dev.santiescobares.ubesweb.post.PostRepository;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.punishment.PunishmentRepository;
import dev.santiescobares.ubesweb.service.dto.DashboardDataDTO;
import dev.santiescobares.ubesweb.suggestion.Suggestion;
import dev.santiescobares.ubesweb.suggestion.SuggestionMapper;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionRepository;
import dev.santiescobares.ubesweb.suggestion.repository.SuggestionVoteRepository;
import dev.santiescobares.ubesweb.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AnalyticsServiceTest {

    @Mock UserRepository userRepository;
    @Mock PunishmentRepository punishmentRepository;
    @Mock SuggestionRepository suggestionRepository;
    @Mock SuggestionVoteRepository suggestionVoteRepository;
    @Mock PostRepository postRepository;
    @Mock EventRepository eventRepository;
    @Mock CompetitionRepository competitionRepository;
    @Mock PostMapper postMapper;
    @Mock SuggestionMapper suggestionMapper;

    @InjectMocks AnalyticsService analyticsService;

    // --- counts ---

    @Test
    void getDashboardData_countsWithData_returnsCorrectDeltas() {
        when(userRepository.count()).thenReturn(100L);
        when(userRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(5L);
        when(punishmentRepository.countActivePunishments(any(LocalDateTime.class))).thenReturn(3L);
        when(punishmentRepository.countActivePunishmentsAsOf(any(Instant.class), any(LocalDateTime.class))).thenReturn(1L);
        when(suggestionRepository.count()).thenReturn(50L);
        when(suggestionRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(2L);
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.counts().users().current()).isEqualTo(100L);
        assertThat(result.counts().users().delta()).isEqualTo(5L);
        assertThat(result.counts().activePunishments().current()).isEqualTo(3L);
        assertThat(result.counts().activePunishments().delta()).isEqualTo(2L);
        assertThat(result.counts().suggestions().current()).isEqualTo(50L);
        assertThat(result.counts().suggestions().delta()).isEqualTo(2L);
    }

    @Test
    void getDashboardData_countsWithNoData_returnsZeroDeltas() {
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
        when(punishmentRepository.countActivePunishments(any(LocalDateTime.class))).thenReturn(0L);
        when(punishmentRepository.countActivePunishmentsAsOf(any(Instant.class), any(LocalDateTime.class))).thenReturn(0L);
        when(suggestionRepository.count()).thenReturn(0L);
        when(suggestionRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.counts().users().current()).isZero();
        assertThat(result.counts().users().delta()).isZero();
        assertThat(result.counts().activePunishments().current()).isZero();
        assertThat(result.counts().activePunishments().delta()).isZero();
    }

    @Test
    void getDashboardData_punishmentDelta_canBeNegative() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
        when(punishmentRepository.countActivePunishments(any(LocalDateTime.class))).thenReturn(2L);
        when(punishmentRepository.countActivePunishmentsAsOf(any(Instant.class), any(LocalDateTime.class))).thenReturn(5L);
        when(suggestionRepository.count()).thenReturn(0L);
        when(suggestionRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.counts().activePunishments().delta()).isEqualTo(-3L);
    }

    // --- lastPost ---

    @Test
    void getDashboardData_lastPost_nullWhenNoPosts() {
        stubZeroCounts();
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.lastPost()).isNull();
    }

    @Test
    void getDashboardData_lastPost_returnsMappedDTOWhenPostExists() {
        stubZeroCounts();
        Post post = new Post();
        PostDTO postDTO = new PostDTO(1L, Instant.now(), Instant.now(), null, "Title", "Body", null);
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.of(post));
        when(postMapper.toDTO(post)).thenReturn(postDTO);
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.lastPost()).isEqualTo(postDTO);
    }

    // --- upcomingItems ---

    @Test
    void getDashboardData_upcomingItems_filteredAndSortedCorrectly() {
        stubZeroCounts();
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());

        LocalDateTime past = LocalDateTime.now().minusDays(1);
        LocalDateTime future = LocalDateTime.now().plusDays(3);
        LocalDateTime farFuture = LocalDateTime.now().plusDays(10);

        Event event = new Event();
        event.setType(EventType.SPECIAL);
        event.setName("Event A");
        event.setStartingDate(future);
        event.setEndingDate(farFuture);

        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of(event));
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.upcomingItems()).hasSize(1);
        assertThat(result.upcomingItems().get(0).name()).isEqualTo("Event A");
        assertThat(result.upcomingItems().get(0).kind()).isEqualTo("EVENT");
        assertThat(result.upcomingItems().get(0).active()).isFalse();
    }

    @Test
    void getDashboardData_upcomingItems_limitedToFive() {
        stubZeroCounts();
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());

        List<Event> events = new java.util.ArrayList<>();
        for (int i = 0; i < 5; i++) {
            Event e = new Event();
            e.setType(EventType.OTHER);
            e.setName("Event " + i);
            e.setStartingDate(LocalDateTime.now().plusDays(i + 1));
            e.setEndingDate(LocalDateTime.now().plusDays(i + 2));
            events.add(e);
        }
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(events);

        Competition competition = new Competition();
        competition.setType(EventType.COMPETITION);
        competition.setName("Comp A");
        competition.setStartingDate(LocalDateTime.now().plusDays(1));
        competition.setEndingDate(LocalDateTime.now().plusDays(5));
        competition.setStatus(CompetitionStatus.SCHEDULED);
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of(competition));
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.upcomingItems()).hasSizeLessThanOrEqualTo(5);
    }

    // --- latestSuggestions ---

    @Test
    void getDashboardData_latestSuggestions_emptyWhenNone() {
        stubZeroCounts();
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of());

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.latestSuggestions()).isEmpty();
    }

    @Test
    void getDashboardData_latestSuggestions_mapsVotesCorrectly() {
        stubZeroCounts();
        when(postRepository.findTopByOrderByCreatedAtDesc()).thenReturn(Optional.empty());
        when(eventRepository.findUpcomingEvents(any(LocalDateTime.class), any())).thenReturn(List.of());
        when(competitionRepository.findUpcomingCompetitions(any(LocalDateTime.class), any())).thenReturn(List.of());

        Suggestion suggestion = new Suggestion();
        when(suggestionRepository.findTop8ByHiddenAtIsNullOrderByCreatedAtDesc()).thenReturn(List.of(suggestion));

        List<Object[]> voteStats = Collections.singletonList(new Object[]{suggestion.getId(), 10L, 7L});
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(anyList())).thenReturn(voteStats);

        SuggestionDTO dto = new SuggestionDTO(1L, Instant.now(), Instant.now(), null, "content", 10, 7);
        when(suggestionMapper.toDTO(suggestion, 10, 7)).thenReturn(dto);

        DashboardDataDTO result = analyticsService.getDashboardData();

        assertThat(result.latestSuggestions()).hasSize(1);
        assertThat(result.latestSuggestions().get(0).totalVotes()).isEqualTo(10);
        assertThat(result.latestSuggestions().get(0).votesInFavor()).isEqualTo(7);
    }

    // --- helpers ---

    private void stubZeroCounts() {
        when(userRepository.count()).thenReturn(0L);
        when(userRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
        when(punishmentRepository.countActivePunishments(any(LocalDateTime.class))).thenReturn(0L);
        when(punishmentRepository.countActivePunishmentsAsOf(any(Instant.class), any(LocalDateTime.class))).thenReturn(0L);
        when(suggestionRepository.count()).thenReturn(0L);
        when(suggestionRepository.countByCreatedAtAfter(any(Instant.class))).thenReturn(0L);
    }
}
