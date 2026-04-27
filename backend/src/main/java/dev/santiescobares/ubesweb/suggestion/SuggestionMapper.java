package dev.santiescobares.ubesweb.suggestion;

import dev.santiescobares.ubesweb.suggestion.dto.SuggestionCreateDTO;
import dev.santiescobares.ubesweb.suggestion.dto.SuggestionDTO;
import dev.santiescobares.ubesweb.user.UserMapper;
import org.mapstruct.Mapper;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {UserMapper.class}
)
public interface SuggestionMapper {

    Suggestion toEntity(SuggestionCreateDTO dto);

    SuggestionDTO toDTO(Suggestion suggestion, int totalVotes, int votesInFavor);
}
