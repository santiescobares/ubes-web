package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.model.GeneralMapper;
import dev.santiescobares.ubesweb.post.dto.PostCreateDTO;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.post.dto.PostUpdateDTO;
import dev.santiescobares.ubesweb.user.UserMapper;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class, GeneralMapper.class}
)
public interface PostMapper {

    Post toEntity(PostCreateDTO dto);

    @Mapping(source = "bannerKey", target = "bannerURL", qualifiedByName = "r2KeyToR2URL")
    PostDTO toDTO(Post post);

    void updateFromDTO(@MappingTarget Post post, PostUpdateDTO dto);
}
