package dev.santiescobares.ubesweb.model;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.model.location.Location;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface GeneralMapper {

    Location toLocationEntity(LocationDTO dto);

    LocationDTO toLocationDTO(Location location);

    @Named("r2KeyToR2URL")
    default String mapKeyToURL(String key) {
        if (key == null) return null;
        return Global.R2_PUBLIC_URL + "/" + key;
    }
}
