package dev.santiescobares.ubesweb.competition.mapper;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ParticipantMapper {

    @Mapping(target = "school", ignore = true)
    Participant toEntity(ParticipantCreateDTO dto);

    ParticipantDTO toDTO(Participant participant);

    @Mapping(target = "school", ignore = true)
    void updateFromDTO(@MappingTarget Participant participant, ParticipantUpdateDTO dto);
}
