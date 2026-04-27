package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.post.dto.PostCreateDTO;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.post.dto.PostUpdateDTO;
import dev.santiescobares.ubesweb.service.StorageService;
import dev.santiescobares.ubesweb.user.UserMapper;
import org.mapstruct.*;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class}
)
public abstract class PostMapper {

    @Autowired
    protected StorageService storageService;
    @Autowired
    protected S3Config s3Config;

    public abstract Post toEntity(PostCreateDTO dto);

    @Mapping(source = "bannerKey", target = "bannerURL", qualifiedByName = "r2KeyToR2PresignedURL")
    public abstract PostDTO toDTO(Post post);

    public abstract void updateFromDTO(@MappingTarget Post post, PostUpdateDTO dto);

    @Named("r2KeyToR2PresignedURL")
    protected String mapKeyToPresignedURL(String key) {
        if (key == null) return null;

        RoleAuthority roleAuthority = RequestContextHolder.getCurrentSession().role().getAuthority();
        if (roleAuthority != RoleAuthority.EXECUTIVE && roleAuthority != RoleAuthority.PRESS) return null;

        return storageService.generateDownloadPresignedUrl(s3Config.getPrivateBucket(), key, Duration.ofMinutes(5));
    }
}
