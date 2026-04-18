package dev.santiescobares.ubesweb.event;

import dev.santiescobares.ubesweb.event.dto.EventCreateDTO;
import dev.santiescobares.ubesweb.event.dto.EventDTO;
import dev.santiescobares.ubesweb.event.dto.EventUpdateDTO;
import dev.santiescobares.ubesweb.model.GeneralMapper;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Collection;
import java.util.List;

@Mapper(
        componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE,
        uses = {GeneralMapper.class}
)
public interface EventMapper {

    Event toEntity(EventCreateDTO dto);

    @Mapping(source = "bannerKey", target = "bannerURL", qualifiedByName = "r2KeyToR2URL")
    EventDTO toDTO(Event event);

    @Mapping(source = "bannerKey", target = "bannerURL", qualifiedByName = "r2KeyToR2URL")
    List<EventDTO> toDTOList(Collection<Event> events);

    void updateFromDTO(@MappingTarget Event event, EventUpdateDTO dto);
}
