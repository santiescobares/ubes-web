package dev.santiescobares.ubesweb.competition.mapper;

import dev.santiescobares.ubesweb.competition.dto.CompetitionCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionDTO;
import dev.santiescobares.ubesweb.competition.dto.CompetitionUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.document.DocumentMapper;
import dev.santiescobares.ubesweb.model.GeneralMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {GeneralMapper.class, DocumentMapper.class}
)
public interface CompetitionMapper {

    Competition toEntity(CompetitionCreateDTO dto);

    @Mapping(source = "bannerKey", target = "bannerURL", qualifiedByName = "r2KeyToR2URL")
    CompetitionDTO toDTO(Competition competition);

    void updateFromDTO(@MappingTarget Competition competition, CompetitionUpdateDTO dto);
}
