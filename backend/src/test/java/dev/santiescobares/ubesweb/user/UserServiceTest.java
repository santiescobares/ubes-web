package dev.santiescobares.ubesweb.user;

import com.auth0.jwt.interfaces.Claim;
import com.auth0.jwt.interfaces.DecodedJWT;
import dev.santiescobares.ubesweb.auth.token.TokenException;
import dev.santiescobares.ubesweb.auth.token.TokenService;
import dev.santiescobares.ubesweb.auth.token.TokenType;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.enums.School;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.dto.UserCreateDTO;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.dto.UserUpdateDTO;
import dev.santiescobares.ubesweb.user.event.UserCreateEvent;
import dev.santiescobares.ubesweb.user.event.UserDeleteEvent;
import dev.santiescobares.ubesweb.user.event.UserUpdateEvent;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Date;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock TokenService tokenService;
    @Mock StorageService storageService;
    @Mock UserRepository userRepository;
    @Mock UserMapper userMapper;
    @Mock StringRedisTemplate redisTemplate;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock S3Config s3Config;

    @InjectMocks UserService userService;

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

    // --- createUser ---

    @Test
    void createUser_withNullDecodedToken_throwsTokenException() {
        when(tokenService.decodeToken("raw-token")).thenReturn(null);

        assertThatThrownBy(() -> userService.createUser(new UserCreateDTO("Juan", "Pérez", School.NACIONAL, "raw-token")))
                .isInstanceOf(TokenException.class);
    }

    @Test
    void createUser_withInvalidTokenType_throwsTokenException() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Claim typeClaim = mock(Claim.class);
        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getClaim("type")).thenReturn(typeClaim);
        when(typeClaim.as(TokenType.class)).thenReturn(TokenType.ACCESS);

        assertThatThrownBy(() -> userService.createUser(new UserCreateDTO("Juan", "Pérez", School.NACIONAL, "raw-token")))
                .isInstanceOf(TokenException.class);
    }

    @Test
    void createUser_withBlacklistedToken_throwsTokenException() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Claim typeClaim = mock(Claim.class);
        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getClaim("type")).thenReturn(typeClaim);
        when(typeClaim.as(TokenType.class)).thenReturn(TokenType.REGISTRATION);
        when(decoded.getId()).thenReturn("token-id");
        when(redisTemplate.hasKey(anyString())).thenReturn(true);

        assertThatThrownBy(() -> userService.createUser(new UserCreateDTO("Juan", "Pérez", School.NACIONAL, "raw-token")))
                .isInstanceOf(TokenException.class);
    }

    @Test
    void createUser_withValidToken_newUser_savesAndPublishesEvent() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Claim typeClaim = mock(Claim.class);
        Claim emailClaim = mock(Claim.class);
        User newUser = new User();
        newUser.setId(UUID.randomUUID());
        UserDTO userDTO = mock(UserDTO.class);

        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getClaim("type")).thenReturn(typeClaim);
        when(typeClaim.as(TokenType.class)).thenReturn(TokenType.REGISTRATION);
        when(decoded.getId()).thenReturn("token-id");
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(decoded.getSubject()).thenReturn("google-sub");
        when(userRepository.findByGoogleIdIncludingDeleted("google-sub")).thenReturn(Optional.of(newUser));
        when(decoded.getClaim("email")).thenReturn(emailClaim);
        when(emailClaim.asString()).thenReturn("juan@test.com");
        when(decoded.getExpiresAt()).thenReturn(new Date(System.currentTimeMillis() + 60_000));
        when(redisTemplate.opsForValue()).thenReturn(mock(ValueOperations.class));
        when(userMapper.toDTO(newUser)).thenReturn(userDTO);

        UserDTO result = userService.createUser(new UserCreateDTO("Juan", "Pérez", School.NACIONAL, "raw-token"));

        assertThat(result).isEqualTo(userDTO);
        verify(userRepository).save(newUser);
        verify(eventPublisher).publishEvent(any(UserCreateEvent.class));
    }

    @Test
    void createUser_withDeletedUser_restoresAccount() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Claim typeClaim = mock(Claim.class);
        Claim emailClaim = mock(Claim.class);
        User deletedUser = new User();
        deletedUser.setId(UUID.randomUUID());
        deletedUser.setDeletedAt(java.time.Instant.now().minusSeconds(100));
        UserDTO userDTO = mock(UserDTO.class);

        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getClaim("type")).thenReturn(typeClaim);
        when(typeClaim.as(TokenType.class)).thenReturn(TokenType.REGISTRATION);
        when(decoded.getId()).thenReturn("token-id");
        when(redisTemplate.hasKey(anyString())).thenReturn(false);
        when(decoded.getSubject()).thenReturn("google-sub");
        when(userRepository.findByGoogleIdIncludingDeleted("google-sub")).thenReturn(Optional.of(deletedUser));
        when(decoded.getClaim("email")).thenReturn(emailClaim);
        when(emailClaim.asString()).thenReturn("juan@test.com");
        when(decoded.getExpiresAt()).thenReturn(new Date(System.currentTimeMillis() + 60_000));
        when(redisTemplate.opsForValue()).thenReturn(mock(ValueOperations.class));
        when(userMapper.toDTO(deletedUser)).thenReturn(userDTO);

        userService.createUser(new UserCreateDTO("Juan", "Pérez", School.NACIONAL, "raw-token"));

        assertThat(deletedUser.getDeletedAt()).isNull();
        verify(userRepository).save(deletedUser);
    }

    // --- updateUser ---

    @Test
    void updateUser_selfUpdate_updatesAndPublishesEvent() {
        User user = new User();
        user.setId(currentUserId);
        user.setRole(Role.USER);
        UserDTO userDTO = mock(UserDTO.class);
        UserUpdateDTO dto = new UserUpdateDTO(null, null, null, null);

        when(userRepository.findById(currentUserId)).thenReturn(Optional.of(user));
        when(userMapper.toDTO(user)).thenReturn(userDTO);

        UserDTO result = userService.updateUser(null, dto);

        assertThat(result).isEqualTo(userDTO);
        verify(eventPublisher).publishEvent(any(UserUpdateEvent.class));
    }

    // --- deleteUser ---

    @Test
    void deleteUser_activeUser_deletesAndPublishesEvent() {
        User user = new User();
        user.setId(currentUserId);
        HttpServletRequest req = mock(HttpServletRequest.class);
        HttpServletResponse res = mock(HttpServletResponse.class);

        when(userRepository.findById(currentUserId)).thenReturn(Optional.of(user));

        userService.deleteUser(req, res);

        verify(userRepository).delete(user);
        verify(eventPublisher).publishEvent(any(UserDeleteEvent.class));
    }

    // --- getById ---

    @Test
    void getById_notFound_throwsResourceNotFoundException() {
        UUID id = UUID.randomUUID();
        when(userRepository.findById(id)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> userService.getById(id))
                .isInstanceOf(ResourceNotFoundException.class);
    }

    // --- getAllUsers ---

    @Test
    void getAllUsers_returnsMappedPage() {
        User user = new User();
        UserDTO userDTO = mock(UserDTO.class);
        Pageable pageable = PageRequest.of(0, 10);
        Page<User> page = new PageImpl<>(List.of(user));

        when(userRepository.findAll(pageable)).thenReturn(page);
        when(userMapper.toDTO(user)).thenReturn(userDTO);

        Page<UserDTO> result = userService.getAllUsers(pageable);

        assertThat(result.getContent()).containsExactly(userDTO);
    }

    // --- findByGoogleId ---

    @Test
    void findByGoogleId_delegatesToRepository() {
        User user = new User();
        when(userRepository.findByGoogleId("google-sub")).thenReturn(Optional.of(user));

        Optional<User> result = userService.findByGoogleId("google-sub");

        assertThat(result).contains(user);
    }
}
