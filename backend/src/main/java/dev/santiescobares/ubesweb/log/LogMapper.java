package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.log.dto.LogDTO;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface LogMapper {

    LogDTO toDTO(Log log);
}
