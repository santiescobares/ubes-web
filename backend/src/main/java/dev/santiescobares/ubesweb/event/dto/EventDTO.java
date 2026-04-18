package dev.santiescobares.ubesweb.event.dto;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.location.LocationDTO;

import java.time.Instant;
import java.time.LocalDateTime;

public record EventDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        EventType type,
        String name,
        String description,
        LocalDateTime startingDate,
        LocalDateTime endingDate,
        LocationDTO location,
        String bannerURL
) {
}
