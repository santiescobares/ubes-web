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
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserMapper;
import dev.santiescobares.ubesweb.user.UserService;
import dev.santiescobares.ubesweb.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.concurrent.TimeUnit;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final TokenService tokenService;

    private final UserService userService;

    private final UserMapper userMapper;

    private final GoogleIdTokenVerifier googleIdTokenVerifier;

    private final StringRedisTemplate redisTemplate;

    private final ApplicationEventPublisher eventPublisher;

    private final JwtConfig jwtConfig;

    public LoginResponseDTO login(LoginRequestDTO dto, HttpServletRequest request, HttpServletResponse response) {
        eventPublisher.publishEvent(new PreLoginEvent(request, response));

        GoogleIdToken idToken;
        try {
            idToken = googleIdTokenVerifier.verify(dto.googleIdToken());
            if (idToken == null) {
                throw new TokenException("Invalid or expired Google ID Token");
            }
        } catch (Exception e) {
            log.error("An error occurred while trying to validate a Google ID Token. {}", e.getMessage());
            throw new ThirdPartyException("An error occurred while trying to validate your Google ID Token");
        }

        String incomingAccessToken = CookieUtil.getCookie(request, ACCESS_TOKEN_COOKIE);
        if (incomingAccessToken != null) {
            CookieUtil.clearHttpOnlyCookie(response, ACCESS_TOKEN_COOKIE);
            blacklistToken(incomingAccessToken);
        }

        GoogleIdToken.Payload payload = idToken.getPayload();
        Optional<User> userOp = userService.findByGoogleId(payload.getSubject());

        LoginResponseDTO responseDTO;
        if (userOp.isPresent()) {
            User user = userOp.get();
            if (!user.isActive()) {
                throw new InactiveUserException("Your account is banned");
            }

            CookieUtil.setHttpOnlyCookie(
                    response,
                    ACCESS_TOKEN_COOKIE,
                    tokenService.generateAccessToken(user),
                    jwtConfig.getAccessExpiration()
            );

            responseDTO = new LoginResponseDTO(null, userMapper.toDTO(user));

            eventPublisher.publishEvent(new PostLoginEvent(request, response, user));
        } else {
            responseDTO = new LoginResponseDTO(tokenService.generateRegistrationToken(payload), null);
        }

        return responseDTO;
    }

    public void logout(HttpServletRequest request, HttpServletResponse response) {
        eventPublisher.publishEvent(new PreLogoutEvent(request, response));

        clearAccessToken(request, response);

        eventPublisher.publishEvent(new PostLogoutEvent(request, response));
    }

    public void clearAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String incomingToken = CookieUtil.getCookie(request, ACCESS_TOKEN_COOKIE);
        if (incomingToken != null) {
            blacklistToken(incomingToken);
        }
        CookieUtil.clearHttpOnlyCookie(response, ACCESS_TOKEN_COOKIE);
    }

    public void blacklistToken(String rawToken) {
        DecodedJWT token = tokenService.decodeToken(rawToken);
        if (token == null) return;

        redisTemplate.opsForValue().set(
                REDIS_TOKEN_BLACKLIST_KEY + token.getId(),
                Instant.now().toString(),
                token.getExpiresAt().getTime() - System.currentTimeMillis(),
                TimeUnit.MILLISECONDS
        );
    }
}
