package dev.santiescobares.ubesweb.user;

import com.auth0.jwt.interfaces.DecodedJWT;
import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.auth.token.TokenException;
import dev.santiescobares.ubesweb.auth.token.TokenService;
import dev.santiescobares.ubesweb.auth.token.TokenType;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.dto.UserCreateDTO;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.dto.UserPictureDTO;
import dev.santiescobares.ubesweb.user.dto.UserUpdateDTO;
import dev.santiescobares.ubesweb.user.event.UserCreateEvent;
import dev.santiescobares.ubesweb.user.event.UserDeleteEvent;
import dev.santiescobares.ubesweb.user.event.UserUpdateEvent;
import dev.santiescobares.ubesweb.util.FileUtil;
import dev.santiescobares.ubesweb.util.ImageUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final long MAX_PICTURE_FILE_SIZE = 10_485_760;
    private static final int PICTURE_SIZE = 256;

    private final TokenService tokenService;
    private final StorageService storageService;

    private final UserRepository userRepository;

    private final UserMapper userMapper;

    private final StringRedisTemplate redisTemplate;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

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

        eventPublisher.publishEvent(new UserCreateEvent(user.getId(), user));

        return userMapper.toDTO(user);
    }

    @Transactional
    public UserDTO updateUser(UUID id, UserUpdateDTO dto) {
        if (id != null) {
            checkCanModifyUser(id);
        } else {
            id = RequestContextHolder.getCurrentSession().userId();
        }

        User user = getById(id);
        userMapper.updateFromDTO(user, dto);

        if (dto.school() != null && RequestContextHolder.getCurrentSession().role().surpasses(user.getRole())) {
            user.setSchool(dto.school());
        }

        eventPublisher.publishEvent(new UserUpdateEvent(RequestContextHolder.getCurrentSession().userId(), user));

        return userMapper.toDTO(user);
    }

    public UserPictureDTO updateUserPicture(UUID id, MultipartFile pictureFile) {
        if (id != null) {
            checkCanModifyUser(id);
        } else {
            id = RequestContextHolder.getCurrentSession().userId();
        }

        User user = getById(id);
        String pictureURL;

        if (pictureFile != null && !pictureFile.isEmpty()) {
            FileUtil.validateExtension(pictureFile, ImageUtil.IMAGE_FORMATS);
            FileUtil.validateSize(pictureFile, MAX_PICTURE_FILE_SIZE);

            MultipartFile resizedFile;
            try {
                resizedFile = ImageUtil.resize(pictureFile, PICTURE_SIZE, PICTURE_SIZE);
            } catch (IOException e) {
                throw new RuntimeException("An internal error ocurred while trying to resize an image");
            }

            String pictureKey = storageService.uploadRandomFile(resizedFile, s3Config.getPublicBucket(), R2_USER_PICTURES_PATH);

            user.setPictureKey(pictureKey);
            pictureURL = R2_PUBLIC_URL + "/" + pictureKey;
        } else {
            user.setPictureKey(null);
            pictureURL = null;
        }

        eventPublisher.publishEvent(new UserUpdateEvent(RequestContextHolder.getCurrentSession().userId(), user));

        return new UserPictureDTO(pictureURL);
    }

    @Transactional
    public void deleteUser(HttpServletRequest request, HttpServletResponse response) {
        User user = getCurrentUser();
        if (user.isDeleted()) {
            throw new InvalidOperationException("User is already deleted");
        }

        userRepository.delete(user);

        eventPublisher.publishEvent(new UserDeleteEvent(RequestContextHolder.getCurrentSession().userId(), user, request, response));
    }

    @Transactional(readOnly = true)
    public UserDTO getUserDTO(UUID id) {
        if (id != null) {
            checkCanModifyUser(id);
        } else {
            id = RequestContextHolder.getCurrentSession().userId();
        }
        return userMapper.toDTO(getById(id));
    }

    public User getById(UUID id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.USER));
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

    private void checkCanModifyUser(UUID userId) {
        RequestContextData contextData = RequestContextHolder.getCurrentSession();
        if (!userId.equals(contextData.userId()) && contextData.role().getAuthority() != RoleAuthority.EXECUTIVE) {
            throw new InvalidOperationException("Can't perform that operation");
        }
    }
}
