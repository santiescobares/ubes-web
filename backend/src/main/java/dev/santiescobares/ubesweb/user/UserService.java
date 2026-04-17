package dev.santiescobares.ubesweb.user;

import com.auth0.jwt.interfaces.DecodedJWT;
import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.auth.token.TokenException;
import dev.santiescobares.ubesweb.auth.token.TokenService;
import dev.santiescobares.ubesweb.auth.token.TokenType;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.user.dto.UserCreateDTO;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.event.UserCreateEvent;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class UserService {

    private final TokenService tokenService;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final StringRedisTemplate redisTemplate;

    private final ApplicationEventPublisher eventPublisher;

    @Transactional
    public UserDTO createUser(UserCreateDTO dto) {
        String rawToken = dto.registrationToken();
        DecodedJWT token = tokenService.decodeToken(rawToken);

        if (token == null || token.getClaim("type").as(TokenType.class) != TokenType.REGISTRATION) {
            throw new TokenException("Invalid or expired registration token");
        }
        String tokenBlacklistKey = Global.REDIS_TOKEN_BLACKLIST_KEY + token.getId();
        if (redisTemplate.hasKey(tokenBlacklistKey)) {
            throw new TokenException("Invalid or expired registration token");
        }

        User user = userRepository.findByGoogleIdIncludingDeleted(token.getSubject()).orElse(new User());
        user.setFirstName(dto.firstName());
        user.setLastName(dto.lastName());
        user.setEmail(token.getClaim("email").asString());
        user.setRole(Role.USER);
        user.setSchool(dto.school());
        user.setActive(true);

        if (user.isDeleted()) {
            user.setDeletedAt(null);
        } else {
            user.setGoogleId(token.getSubject());
        }

        userRepository.save(user);

        redisTemplate.opsForValue().set(
                tokenBlacklistKey,
                Instant.now().toString(),
                token.getExpiresAt().getTime() - System.currentTimeMillis(),
                TimeUnit.MILLISECONDS
        );

        eventPublisher.publishEvent(new UserCreateEvent(user));

        return userMapper.toDTO(user);
    }

    private Optional<User> findById(UUID id) {
        return userRepository.findById(id);
    }

    public User getById(UUID id) {
        return findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.USER));
    }

    public User getCurrentUser() {
        UUID currentUserId = RequestContextHolder.getCurrentSession().userId();
        if (currentUserId == null) {
            throw new IllegalArgumentException("No user loaded in current context");
        }
        return getById(currentUserId);
    }

    public Optional<User> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }
}
