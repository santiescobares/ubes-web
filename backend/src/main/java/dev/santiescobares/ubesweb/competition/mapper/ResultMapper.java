package dev.santiescobares.ubesweb.competition.mapper;

import dev.santiescobares.ubesweb.competition.dto.result.ResultCreateDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultDTO;
import dev.santiescobares.ubesweb.competition.dto.result.ResultUpdateDTO;
import dev.santiescobares.ubesweb.competition.entity.Result;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {ParticipantMapper.class}
)
public interface ResultMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competition", ignore = true)
    @Mapping(target = "positionNumber", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "participant", ignore = true)
    Result toEntity(ResultCreateDTO dto);

    ResultDTO toDTO(Result result);

    List<ResultDTO> toDTOList(List<Result> results);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "competition", ignore = true)
    @Mapping(target = "positionType", ignore = true)
    @Mapping(target = "positionNumber", ignore = true)
    @Mapping(target = "points", ignore = true)
    @Mapping(target = "participant", ignore = true)
    void updateFromDTO(@MappingTarget Result result, ResultUpdateDTO dto);
}
