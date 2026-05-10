package dev.santiescobares.ubesweb.model;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.config.S3Config;
import dev.santiescobares.ubesweb.model.location.Location;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import dev.santiescobares.ubesweb.service.StorageService;
import org.mapstruct.Mapper;
import org.mapstruct.Named;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.springframework.beans.factory.annotation.Autowired;

import java.time.Duration;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public abstract class GeneralMapper {

    @Autowired
    protected StorageService storageService;
    @Autowired
    protected S3Config s3Config;

    public abstract Location toLocationEntity(LocationDTO dto);

    public abstract LocationDTO toLocationDTO(Location location);

    @Named("r2KeyToR2URL")
    public String mapKeyToURL(String key) {
        if (key == null) return null;
        return Global.R2_PUBLIC_URL + "/" + key;
    }

    @Named("r2KeyToR2PresignedURL")
    public String mapKeyToPresignedURL(String key) {
        if (key == null) return null;
        return storageService.generateDownloadPresignedUrl(s3Config.getPrivateBucket(), key, Duration.ofMinutes(1));
    }
}
