package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.post.dto.PostCreateDTO;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.post.dto.PostUpdateDTO;
import dev.santiescobares.ubesweb.post.event.PostCreateEvent;
import dev.santiescobares.ubesweb.post.event.PostDeleteEvent;
import dev.santiescobares.ubesweb.post.event.PostUpdateEvent;
import dev.santiescobares.ubesweb.service.StorageService;
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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock UserService userService;
    @Mock StorageService storageService;
    @Mock PostRepository postRepository;
    @Mock PostMapper postMapper;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks PostService postService;

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

    // --- createPost ---

    @Test
    void createPost_withUniqueSlug_savesAndReturnsDTO() {
        PostCreateDTO dto = new PostCreateDTO("Titulo del Post", "Cuerpo del post con mas de diez caracteres");
        Post post = new Post();
        post.setId(1L);
        User currentUser = new User();
        PostDTO postDTO = mock(PostDTO.class);

        when(postMapper.toEntity(dto)).thenReturn(post);
        when(userService.getCurrentUser()).thenReturn(currentUser);
        when(postRepository.existsBySlug(any())).thenReturn(false);
        when(postMapper.toDTO(post)).thenReturn(postDTO);

        PostDTO result = postService.createPost(dto, null);

        assertThat(result).isEqualTo(postDTO);
        assertThat(post.getCreatedBy()).isEqualTo(currentUser);
        assertThat(post.getSlug()).isNotNull();
        verify(postRepository).save(post);
        verify(eventPublisher).publishEvent(any(PostCreateEvent.class));
    }

    @Test
    void createPost_withDuplicateSlug_appendsSuffixToSlug() {
        PostCreateDTO dto = new PostCreateDTO("Titulo Repetido", "Contenido de prueba largo");
        Post post = new Post();
        post.setId(1L);

        when(postMapper.toEntity(dto)).thenReturn(post);
        when(userService.getCurrentUser()).thenReturn(new User());
        when(postRepository.existsBySlug(any())).thenReturn(true);
        when(postMapper.toDTO(post)).thenReturn(mock(PostDTO.class));

        postService.createPost(dto, null);

        assertThat(post.getSlug()).contains("-");
    }

    // --- updatePost ---

    @Test
    void updatePost_notFound_throwsResourceNotFoundException() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.updatePost(99L, new PostUpdateDTO(null, null), null, null))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void updatePost_withRemoveBanner_clearsBannerKey() {
        Post post = new Post();
        post.setId(1L);
        post.setBannerKey("old-key");
        PostUpdateDTO dto = new PostUpdateDTO(null, null);

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postMapper.toDTO(post)).thenReturn(mock(PostDTO.class));

        postService.updatePost(1L, dto, null, true);

        assertThat(post.getBannerKey()).isNull();
        verify(eventPublisher).publishEvent(any(PostUpdateEvent.class));
    }

    @Test
    void updatePost_withValidData_savesAndPublishesEvent() {
        Post post = new Post();
        post.setId(1L);
        PostUpdateDTO dto = new PostUpdateDTO("Nuevo Titulo", null);
        PostDTO postDTO = mock(PostDTO.class);

        when(postRepository.findById(1L)).thenReturn(Optional.of(post));
        when(postMapper.toDTO(post)).thenReturn(postDTO);

        PostDTO result = postService.updatePost(1L, dto, null, null);

        assertThat(result).isEqualTo(postDTO);
        verify(postRepository).save(post);
        verify(eventPublisher).publishEvent(any(PostUpdateEvent.class));
    }

    // --- deletePost ---

    @Test
    void deletePost_notFound_throwsResourceNotFoundException() {
        when(postRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.deletePost(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void deletePost_valid_deletesAndPublishesEvent() {
        Post post = new Post();
        post.setId(1L);
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        postService.deletePost(1L);

        verify(postRepository).delete(post);
        verify(eventPublisher).publishEvent(any(PostDeleteEvent.class));
    }

    // --- getPostDTOBySlug ---

    @Test
    void getPostDTOBySlug_notFound_throwsResourceNotFoundException() {
        when(postRepository.findBySlug("slug-inexistente")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> postService.getPostDTOBySlug("slug-inexistente"))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    @Test
    void getPostDTOBySlug_found_returnsDTO() {
        Post post = new Post();
        PostDTO postDTO = mock(PostDTO.class);

        when(postRepository.findBySlug("mi-post")).thenReturn(Optional.of(post));
        when(postMapper.toDTO(post)).thenReturn(postDTO);

        PostDTO result = postService.getPostDTOBySlug("mi-post");

        assertThat(result).isEqualTo(postDTO);
    }

    // --- getPostDTOs ---

    @Test
    void getPostDTOs_returnsMappedPage() {
        Post post = new Post();
        PostDTO postDTO = mock(PostDTO.class);
        PageRequest pageable = PageRequest.of(0, 10);
        Page<Post> page = new PageImpl<>(List.of(post));

        when(postRepository.findAll(pageable)).thenReturn(page);
        when(postMapper.toDTO(post)).thenReturn(postDTO);

        Page<PostDTO> result = postService.getPostDTOs(pageable);

        assertThat(result.getContent()).containsExactly(postDTO);
    }
}
