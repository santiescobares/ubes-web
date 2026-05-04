package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.type.ResourceNotFoundException;
import dev.santiescobares.ubesweb.post.dto.PostCreateDTO;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.post.dto.PostUpdateDTO;
import dev.santiescobares.ubesweb.post.event.PostCreateEvent;
import dev.santiescobares.ubesweb.post.event.PostDeleteEvent;
import dev.santiescobares.ubesweb.post.event.PostUpdateEvent;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.UserService;
import dev.santiescobares.ubesweb.util.FileUtil;
import dev.santiescobares.ubesweb.util.ImageUtil;
import dev.santiescobares.ubesweb.util.RandomUtil;
import dev.santiescobares.ubesweb.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import static dev.santiescobares.ubesweb.Global.*;

@Service
@RequiredArgsConstructor
public class PostService {

    private static final long MAX_BANNER_FILE_SIZE = 10_485_760;

    private final UserService userService;
    private final StorageService storageService;

    private final PostRepository postRepository;

    private final PostMapper postMapper;

    private final ApplicationEventPublisher eventPublisher;

    private final S3Config s3Config;

    public PostDTO createPost(PostCreateDTO dto, MultipartFile bannerFile) {
        Post post = postMapper.toEntity(dto);
        post.setCreatedBy(userService.getCurrentUser());
        post.setSlug(generateUniqueSlug(dto.title()));

        if (bannerFile != null && !bannerFile.isEmpty()) {
            FileUtil.validateExtension(bannerFile, ImageUtil.IMAGE_FORMATS);
            FileUtil.validateSize(bannerFile.getSize(), MAX_BANNER_FILE_SIZE);

            String bannerKey = storageService.uploadRandomFile(bannerFile, s3Config.getPublicBucket(), R2_POST_BANNERS_PATH);
            post.setBannerKey(bannerKey);
        }

        postRepository.save(post);

        eventPublisher.publishEvent(new PostCreateEvent(RequestContextHolder.getCurrentSession().userId(), post));

        return postMapper.toDTO(post);
    }

    public PostDTO updatePost(Long id, PostUpdateDTO dto, MultipartFile newBannerFile, Boolean removeBanner) {
        Post post = getById(id);

        postMapper.updateFromDTO(post, dto);

        if (removeBanner != null && removeBanner) {
            post.setBannerKey(null);
        } else {
            if (newBannerFile != null && !newBannerFile.isEmpty()) {
                FileUtil.validateExtension(newBannerFile, ImageUtil.IMAGE_FORMATS);
                FileUtil.validateSize(newBannerFile.getSize(), MAX_BANNER_FILE_SIZE);

                String bannerKey = storageService.uploadRandomFile(newBannerFile, s3Config.getPublicBucket(), R2_POST_BANNERS_PATH);
                post.setBannerKey(bannerKey);
            }
        }

        postRepository.save(post);

        eventPublisher.publishEvent(new PostUpdateEvent(RequestContextHolder.getCurrentSession().userId(), post));

        return postMapper.toDTO(post);
    }

    @Transactional
    public void deletePost(Long id) {
        Post post = getById(id);

        postRepository.delete(post);

        eventPublisher.publishEvent(new PostDeleteEvent(RequestContextHolder.getCurrentSession().userId(), post));
    }

    @Transactional(readOnly = true)
    public PostDTO getPostDTOBySlug(String slug) {
        return postMapper.toDTO(
                postRepository.findBySlug(slug).orElseThrow(() -> new ResourceNotFoundException(ResourceType.POST))
        );
    }

    @Transactional(readOnly = true)
    public Page<PostDTO> getPostDTOs(Pageable pageable) {
        return postRepository.findAll(pageable).map(postMapper::toDTO);
    }

    private Post getById(Long id) {
        return postRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException(ResourceType.POST));
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = StringUtil.normalize(title);
        if (!postRepository.existsBySlug(baseSlug)) {
            return baseSlug;
        }
        return baseSlug + "-" + RandomUtil.randomHexString().substring(0, 6);
    }
}
