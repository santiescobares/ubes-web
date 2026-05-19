package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
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
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SuggestionServiceTest {

    @Mock UserService userService;
    @Mock SuggestionRepository suggestionRepository;
    @Mock SuggestionVoteRepository suggestionVoteRepository;
    @Mock SuggestionMapper suggestionMapper;
    @Mock ApplicationEventPublisher eventPublisher;

    @InjectMocks SuggestionService suggestionService;

    private UUID currentUserId;

    @BeforeEach
    void setUp() {
        currentUserId = UUID.randomUUID();
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.DEVELOPER, "test@ubes.com"));
    }

    @AfterEach
    void tearDown() {
        RequestContextHolder.clear();
    }

    // --- createSuggestion ---

    @Test
    void createSuggestion_savesAndReturnsDTO() {
        SuggestionCreateDTO dto = new SuggestionCreateDTO("Sugerencia de prueba", false);
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        User currentUser = new User();
        SuggestionDTO suggestionDTO = mock(SuggestionDTO.class);

        when(suggestionMapper.toEntity(dto)).thenReturn(suggestion);
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(suggestionMapper.toDTO(suggestion, 0, 0, null)).thenReturn(suggestionDTO);

        SuggestionDTO result = suggestionService.createSuggestion(dto);

        assertThat(result).isEqualTo(suggestionDTO);
        assertThat(suggestion.getCreatedBy()).isEqualTo(currentUser);
        verify(suggestionRepository).save(suggestion);
        verify(eventPublisher).publishEvent(any(SuggestionCreateEvent.class));
    }

    // --- voteSuggestion ---

    @Test
    void voteSuggestion_onHiddenSuggestion_throwsInvalidOperationException() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setHiddenAt(Instant.now());

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

        assertThatThrownBy(() -> suggestionService.voteSuggestion(1L, true))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("hidden");
    }

    @Test
    void voteSuggestion_onOwnSuggestion_throwsInvalidOperationException() {
        User author = new User();
        author.setId(currentUserId);

        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setCreatedBy(author);

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

        assertThatThrownBy(() -> suggestionService.voteSuggestion(1L, true))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("own");
    }

    @Test
    void voteSuggestion_whenAlreadyVoted_throwsInvalidOperationException() {
        User author = new User();
        author.setId(UUID.randomUUID());

        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setCreatedBy(author);

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
        when(suggestionVoteRepository.existsBySuggestionIdAndVoterId(anyLong(), any(UUID.class))).thenReturn(true);

        assertThatThrownBy(() -> suggestionService.voteSuggestion(1L, true))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("already voted");
    }

    @Test
    void voteSuggestion_valid_addsVoteAndPublishesEvent() {
        User author = new User();
        author.setId(UUID.randomUUID());
        User voter = new User();
        voter.setId(currentUserId);

        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setCreatedBy(author);

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
        when(suggestionVoteRepository.existsBySuggestionIdAndVoterId(anyLong(), any(UUID.class))).thenReturn(false);
        when(userService.getCurrentUser()).thenReturn(voter);

        suggestionService.voteSuggestion(1L, true);

        assertThat(suggestion.getVotes()).hasSize(1);
        assertThat(suggestion.getVotes().get(0).isInFavor()).isTrue();
        verify(eventPublisher).publishEvent(any(SuggestionVoteEvent.class));
    }

    // --- hideSuggestion ---

    @Test
    void hideSuggestion_whenAlreadyHidden_throwsInvalidOperationException() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setHiddenAt(Instant.now());

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

        assertThatThrownBy(() -> suggestionService.hideSuggestion(1L))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("already hidden");
    }

    @Test
    void hideSuggestion_valid_setsHiddenAtAndPublishesEvent() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        User currentUser = new User();

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));
        when(userService.getCurrentUser()).thenReturn(currentUser);

        suggestionService.hideSuggestion(1L);

        assertThat(suggestion.isHidden()).isTrue();
        assertThat(suggestion.getHiddenBy()).isEqualTo(currentUser);
        verify(eventPublisher).publishEvent(any(SuggestionUpdateEvent.class));
    }

    // --- unhideSuggestion ---

    @Test
    void unhideSuggestion_whenNotHidden_throwsInvalidOperationException() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

        assertThatThrownBy(() -> suggestionService.unhideSuggestion(1L))
                .isInstanceOf(InvalidOperationException.class)
                .hasMessageContaining("not hidden");
    }

    @Test
    void unhideSuggestion_valid_clearsHiddenAtAndPublishesEvent() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        suggestion.setHiddenAt(Instant.now());

        when(suggestionRepository.findById(1L)).thenReturn(Optional.of(suggestion));

        suggestionService.unhideSuggestion(1L);

        assertThat(suggestion.isHidden()).isFalse();
        verify(eventPublisher).publishEvent(any(SuggestionUpdateEvent.class));
    }

    // --- getSuggestionDTOs ---

    @Test
    void getSuggestionDTOs_asExecutive_includesHiddenSuggestions() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(1L);
        SuggestionDTO suggestionDTO = mock(SuggestionDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Suggestion> page = new PageImpl<>(List.of(suggestion));

        when(suggestionRepository.findAll(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(1L))).thenReturn(List.of());
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(any(UUID.class), anyList())).thenReturn(List.of());
        when(suggestionMapper.toDTO(eq(suggestion), eq(0), eq(0), any())).thenReturn(suggestionDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(suggestionRepository).findAll(pageable);
        verify(suggestionRepository, never()).findAllByHiddenAtIsNull(any());
    }

    @Test
    void getSuggestionDTOs_asNonExecutive_excludesHiddenSuggestions() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "test@ubes.com"));

        Suggestion suggestion = new Suggestion();
        suggestion.setId(2L);
        SuggestionDTO suggestionDTO = mock(SuggestionDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Suggestion> page = new PageImpl<>(List.of(suggestion));

        when(suggestionRepository.findAllByHiddenAtIsNull(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(2L))).thenReturn(List.of());
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(any(UUID.class), anyList())).thenReturn(List.of());
        when(suggestionMapper.toDTO(eq(suggestion), eq(0), eq(0), any())).thenReturn(suggestionDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent()).hasSize(1);
        verify(suggestionRepository).findAllByHiddenAtIsNull(pageable);
        verify(suggestionRepository, never()).findAll(pageable);
    }

    @Test
    void getSuggestionDTOs_withAnonymizedSuggestion_asNonExecutive_hidesAuthor() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "test@ubes.com"));

        Suggestion suggestion = new Suggestion();
        suggestion.setId(3L);
        suggestion.setAnonymized(true);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Suggestion> page = new PageImpl<>(List.of(suggestion));

        SuggestionDTO fullDTO = new SuggestionDTO(3L, null, null, mock(dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO.class), "contenido", true, 0, 0, null, false);

        when(suggestionRepository.findAllByHiddenAtIsNull(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(3L))).thenReturn(List.of());
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(any(UUID.class), anyList())).thenReturn(List.of());
        when(suggestionMapper.toDTO(eq(suggestion), eq(0), eq(0), any())).thenReturn(fullDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent().get(0).createdBy()).isNull();
    }

    @Test
    void getSuggestionDTOs_withAnonymizedSuggestion_asExecutive_showsAuthor() {
        Suggestion suggestion = new Suggestion();
        suggestion.setId(4L);
        suggestion.setAnonymized(true);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Suggestion> page = new PageImpl<>(List.of(suggestion));

        dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO author = mock(dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO.class);
        SuggestionDTO fullDTO = new SuggestionDTO(4L, null, null, author, "contenido", true, 0, 0, null, false);

        when(suggestionRepository.findAll(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(4L))).thenReturn(List.of());
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(any(UUID.class), anyList())).thenReturn(List.of());
        when(suggestionMapper.toDTO(eq(suggestion), eq(0), eq(0), any())).thenReturn(fullDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent().get(0).createdBy()).isEqualTo(author);
    }

    @Test
    void getSuggestionDTOs_notFound_throwsResourceNotFoundException() {
        when(suggestionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> suggestionService.voteSuggestion(99L, true))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- getSuggestionsByDate ---

    @Test
    void getSuggestionsByDate_groupsSuggestionsByDateAndPaginates() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "test@ubes.com"));

        LocalDate today = LocalDate.now(ZoneOffset.UTC);
        LocalDate yesterday = today.minusDays(1);

        Suggestion s1 = new Suggestion();
        s1.setId(10L);
        s1.setCreatedAt(today.atStartOfDay(ZoneOffset.UTC).toInstant());

        Suggestion s2 = new Suggestion();
        s2.setId(11L);
        s2.setCreatedAt(yesterday.atStartOfDay(ZoneOffset.UTC).toInstant());

        PageRequest pageable = PageRequest.of(0, 4);

        when(suggestionRepository.findDistinctDatesPaged(0, 4, false)).thenReturn(List.of(today, yesterday));
        when(suggestionRepository.countDistinctDates(false)).thenReturn(2L);
        when(suggestionRepository.findAllByDates(List.of(today, yesterday), false)).thenReturn(List.of(s1, s2));
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(10L, 11L))).thenReturn(List.of());
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(any(UUID.class), anyList())).thenReturn(List.of());

        SuggestionDTO dto1 = new SuggestionDTO(10L, s1.getCreatedAt(), s1.getCreatedAt(), null, "a", false, 0, 0, null, false);
        SuggestionDTO dto2 = new SuggestionDTO(11L, s2.getCreatedAt(), s2.getCreatedAt(), null, "b", false, 0, 0, null, false);
        when(suggestionMapper.toDTO(eq(s1), eq(0), eq(0), any())).thenReturn(dto1);
        when(suggestionMapper.toDTO(eq(s2), eq(0), eq(0), any())).thenReturn(dto2);

        Page<SuggestionsByDateDTO> result = suggestionService.getSuggestionsByDate(pageable);

        assertThat(result.getTotalElements()).isEqualTo(2);
        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).date()).isEqualTo(today);
        assertThat(result.getContent().get(0).suggestions()).containsExactly(dto1);
        assertThat(result.getContent().get(1).date()).isEqualTo(yesterday);
        assertThat(result.getContent().get(1).suggestions()).containsExactly(dto2);
    }

    @Test
    void getSuggestionDTOs_includesUserVoteForLoggedUser() {
        RequestContextHolder.setCurrentSession(new RequestContextData(currentUserId, Role.USER, "test@ubes.com"));

        Suggestion suggestion = new Suggestion();
        suggestion.setId(20L);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Suggestion> page = new PageImpl<>(List.of(suggestion));

        SuggestionDTO expectedDTO = new SuggestionDTO(20L, null, null, null, "x", false, 1, 1, true, false);

        when(suggestionRepository.findAllByHiddenAtIsNull(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(20L))).thenReturn(List.of());
        List<Object[]> userVotes = new java.util.ArrayList<>();
        userVotes.add(new Object[]{20L, true});
        when(suggestionVoteRepository.findUserVotesBySuggestionIds(eq(currentUserId), anyList()))
                .thenReturn(userVotes);
        when(suggestionMapper.toDTO(eq(suggestion), eq(0), eq(0), eq(true))).thenReturn(expectedDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent().get(0).userVote()).isTrue();
        verify(suggestionVoteRepository).findUserVotesBySuggestionIds(eq(currentUserId), anyList());
    }
}
