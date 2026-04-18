package dev.santiescobares.ubesweb.user;

import dev.santiescobares.ubesweb.model.GeneralMapper;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;
import dev.santiescobares.ubesweb.user.dto.UserUpdateDTO;
import org.mapstruct.*;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {GeneralMapper.class}
)
public interface UserMapper {

    @Mapping(source = "pictureKey", target = "pictureURL", qualifiedByName = "r2KeyToR2URL")
    UserDTO toDTO(User user);

    @Mapping(source = "pictureKey", target = "pictureURL", qualifiedByName = "r2KeyToR2URL")
    UserSnapshotDTO toSnapshotDTO(User user);

    @Mapping(target = "school", ignore = true)
    void updateFromDTO(@MappingTarget User user, UserUpdateDTO dto);
}
