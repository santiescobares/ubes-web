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

    @Mapping(source = "positionType", target = "id.positionType")
    @Mapping(source = "positionNumber", target = "id.positionNumber")
    Result toEntity(ResultCreateDTO dto);

    @Mapping(source = "id.positionType", target = "positionType")
    @Mapping(source = "id.positionNumber", target = "positionNumber")
    ResultDTO toDTO(Result result);

    @Mapping(source = "id.positionType", target = "positionType")
    @Mapping(source = "id.positionNumber", target = "positionNumber")
    List<ResultDTO> toDTOList(List<Result> results);

    void updateFromDTO(@MappingTarget Result result, ResultUpdateDTO dto);
}
