package dev.santiescobares.ubesweb.punishment;

import dev.santiescobares.ubesweb.punishment.dto.PunishmentCreateDTO;
import dev.santiescobares.ubesweb.punishment.dto.PunishmentDTO;
import dev.santiescobares.ubesweb.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class}
)
public interface PunishmentMapper {

    Punishment toEntity(PunishmentCreateDTO dto);

    PunishmentDTO toDTO(Punishment punishment);
}
