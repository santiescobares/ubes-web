package dev.santiescobares.ubesweb.service.dto;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.location.LocationDTO;

import java.time.LocalDateTime;

public record UpcomingItemDTO(
        String kind,
        String id,
        EventType type,
        String name,
        LocationDTO location,
        LocalDateTime startingDate,
        LocalDateTime endingDate,
        boolean active
) {}
