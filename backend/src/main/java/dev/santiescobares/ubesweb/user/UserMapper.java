package dev.santiescobares.ubesweb.user;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;
import dev.santiescobares.ubesweb.user.dto.UserUpdateDTO;
import org.mapstruct.*;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    @Mapping(source = "pictureKey", target = "pictureURL", qualifiedByName = "pictureKeyToURL")
    UserDTO toDTO(User user);

    @Mapping(source = "pictureKey", target = "pictureURL", qualifiedByName = "pictureKeyToURL")
    UserSnapshotDTO toSnapshotDTO(User user);

    @Mapping(target = "school", ignore = true)
    void updateFromDTO(@MappingTarget User user, UserUpdateDTO dto);

    @Named("pictureKeyToURL")
    default String mapPictureKeyToPictureURL(String pictureKey) {
        if (pictureKey == null) return null;
        return Global.R2_PUBLIC_URL + "/" + pictureKey;
    }
}
