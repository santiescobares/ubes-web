package dev.santiescobares.ubesweb.auth;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import dev.santiescobares.ubesweb.auth.dto.LoginRequestDTO;
import dev.santiescobares.ubesweb.auth.dto.LoginResponseDTO;
import dev.santiescobares.ubesweb.auth.event.login.PostLoginEvent;
import dev.santiescobares.ubesweb.auth.event.login.PreLoginEvent;
import dev.santiescobares.ubesweb.auth.event.logout.PostLogoutEvent;
import dev.santiescobares.ubesweb.auth.event.logout.PreLogoutEvent;
import dev.santiescobares.ubesweb.auth.exception.InactiveUserException;
import dev.santiescobares.ubesweb.auth.token.TokenException;
import dev.santiescobares.ubesweb.auth.token.TokenService;
import dev.santiescobares.ubesweb.config.JwtConfig;
import dev.santiescobares.ubesweb.exception.type.ThirdPartyException;
import dev.santiescobares.ubesweb.punishment.PunishmentService;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserMapper;
import dev.santiescobares.ubesweb.user.UserService;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ValueOperations;

import java.util.Date;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock TokenService tokenService;
    @Mock UserService userService;
    @Mock PunishmentService punishmentService;
    @Mock UserMapper userMapper;
    @Mock GoogleIdTokenVerifier googleIdTokenVerifier;
    @Mock StringRedisTemplate redisTemplate;
    @Mock ApplicationEventPublisher eventPublisher;
    @Mock JwtConfig jwtConfig;
    @Mock HttpServletRequest request;
    @Mock HttpServletResponse response;
    @Mock ValueOperations<String, String> valueOperations;

    @InjectMocks AuthService authService;

    @Test
    void login_withNewUser_returnsRegistrationToken() throws Exception {
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        when(googleIdTokenVerifier.verify(anyString())).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);
        when(payload.getSubject()).thenReturn("google-sub-123");
        when(userService.findByGoogleId("google-sub-123")).thenReturn(Optional.empty());
        when(tokenService.generateRegistrationToken(payload)).thenReturn("reg-token");

        LoginResponseDTO result = authService.login(new LoginRequestDTO("google-id-token"), request, response);

        assertThat(result.registrationToken()).isEqualTo("reg-token");
        assertThat(result.user()).isNull();
        verify(eventPublisher).publishEvent(any(PreLoginEvent.class));
    }

    @Test
    void login_withExistingUser_returnsUserDTO() throws Exception {
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        User user = new User();
        UserDTO userDTO = mock(UserDTO.class);

        when(googleIdTokenVerifier.verify(anyString())).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);
        when(payload.getSubject()).thenReturn("google-sub-123");
        when(userService.findByGoogleId("google-sub-123")).thenReturn(Optional.of(user));
        when(punishmentService.hasActivePunishments(user)).thenReturn(false);
        when(tokenService.generateAccessToken(user)).thenReturn("access-token");
        when(userMapper.toDTO(user)).thenReturn(userDTO);
        when(jwtConfig.getAccessExpiration()).thenReturn(3600L);

        LoginResponseDTO result = authService.login(new LoginRequestDTO("google-id-token"), request, response);

        assertThat(result.user()).isEqualTo(userDTO);
        assertThat(result.registrationToken()).isNull();
        verify(eventPublisher).publishEvent(any(PostLoginEvent.class));
    }

    @Test
    void login_withBannedUser_throwsInactiveUserException() throws Exception {
        GoogleIdToken idToken = mock(GoogleIdToken.class);
        GoogleIdToken.Payload payload = mock(GoogleIdToken.Payload.class);
        User user = new User();

        when(googleIdTokenVerifier.verify(anyString())).thenReturn(idToken);
        when(idToken.getPayload()).thenReturn(payload);
        when(payload.getSubject()).thenReturn("google-sub-123");
        when(userService.findByGoogleId("google-sub-123")).thenReturn(Optional.of(user));
        when(punishmentService.hasActivePunishments(user)).thenReturn(true);

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO("google-id-token"), request, response))
                .isInstanceOf(InactiveUserException.class);
    }

    @Test
    void login_withInvalidGoogleToken_throwsThirdPartyException() throws Exception {
        when(googleIdTokenVerifier.verify(anyString())).thenThrow(new RuntimeException("network error"));

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO("google-id-token"), request, response))
                .isInstanceOf(ThirdPartyException.class);
    }

    @Test
    void login_withNullGoogleToken_throwsTokenException() throws Exception {
        when(googleIdTokenVerifier.verify(anyString())).thenReturn(null);

        assertThatThrownBy(() -> authService.login(new LoginRequestDTO("google-id-token"), request, response))
                .isInstanceOf(ThirdPartyException.class);
    }

    @Test
    void blacklistToken_withNullDecodedToken_doesNothing() {
        when(tokenService.decodeToken("raw-token")).thenReturn(null);

        authService.blacklistToken("raw-token");

        verifyNoInteractions(redisTemplate);
    }

    @Test
    void blacklistToken_withExpiredToken_doesNotStore() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Date past = new Date(System.currentTimeMillis() - 10_000);
        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getExpiresAt()).thenReturn(past);

        authService.blacklistToken("raw-token");

        verifyNoInteractions(redisTemplate);
    }

    @Test
    void blacklistToken_withValidNonExpiredToken_storesInRedis() {
        DecodedJWT decoded = mock(DecodedJWT.class);
        Date future = new Date(System.currentTimeMillis() + 60_000);
        when(tokenService.decodeToken("raw-token")).thenReturn(decoded);
        when(decoded.getExpiresAt()).thenReturn(future);
        when(decoded.getId()).thenReturn(UUID.randomUUID().toString());
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);

        authService.blacklistToken("raw-token");

        verify(valueOperations).set(anyString(), anyString(), longThat(l -> l > 0), eq(TimeUnit.MILLISECONDS));
    }

    @Test
    void logout_publishesPreAndPostLogoutEvents() {
        authService.logout(request, response);

        ArgumentCaptor<Object> captor = ArgumentCaptor.forClass(Object.class);
        verify(eventPublisher, times(2)).publishEvent(captor.capture());
        assertThat(captor.getAllValues()).hasAtLeastOneElementOfType(PreLogoutEvent.class);
        assertThat(captor.getAllValues()).hasAtLeastOneElementOfType(PostLogoutEvent.class);
    }
}
