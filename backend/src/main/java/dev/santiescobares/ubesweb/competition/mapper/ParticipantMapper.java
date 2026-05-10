package dev.santiescobares.ubesweb.competition.mapper;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantDTO;
import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.model.GeneralMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {GeneralMapper.class}
)
public interface ParticipantMapper {

    @Mapping(target = "school", ignore = true)
    Participant toEntity(ParticipantCreateDTO dto);

    @Mapping(source = "studentCertificateKey", target = "studentCertificateURL", qualifiedByName = "r2KeyToR2PresignedURL")
    @Mapping(source = "medicalCertificateKey", target = "medicalCertificateURL", qualifiedByName = "r2KeyToR2PresignedURL")
    ParticipantDTO toDTO(Participant participant);

    @Mapping(target = "studentCertificateKey", ignore = true)
    @Mapping(target = "medicalCertificateKey", ignore = true)
    void updateFromDTO(@MappingTarget Participant participant, ParticipantUpdateDTO dto);
}
