package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
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
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
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
        when(suggestionMapper.toDTO(suggestion, 0, 0)).thenReturn(suggestionDTO);

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
        when(suggestionVoteRepository.existsById(any(SuggestionVoteId.class))).thenReturn(true);

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
        when(suggestionVoteRepository.existsById(any(SuggestionVoteId.class))).thenReturn(false);
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
        when(suggestionMapper.toDTO(suggestion, 0, 0)).thenReturn(suggestionDTO);

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
        when(suggestionMapper.toDTO(suggestion, 0, 0)).thenReturn(suggestionDTO);

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

        SuggestionDTO fullDTO = new SuggestionDTO(3L, null, null, mock(dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO.class), "contenido", 0, 0);

        when(suggestionRepository.findAllByHiddenAtIsNull(pageable)).thenReturn(page);
        when(suggestionVoteRepository.getVoteStatsBySuggestionIds(List.of(3L))).thenReturn(List.of());
        when(suggestionMapper.toDTO(suggestion, 0, 0)).thenReturn(fullDTO);

        Page<SuggestionDTO> result = suggestionService.getSuggestionDTOs(pageable);

        assertThat(result.getContent().get(0).createdBy()).isNull();
    }

    @Test
    void getSuggestionDTOs_notFound_throwsResourceNotFoundException() {
        when(suggestionRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> suggestionService.voteSuggestion(99L, true))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
