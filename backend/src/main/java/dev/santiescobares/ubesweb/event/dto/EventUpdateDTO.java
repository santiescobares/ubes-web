package dev.santiescobares.ubesweb.event.dto;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventUpdateDTO(
        EventType type,
        @Size(min = 1, max = 50, message = "Name is either too short or too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @Future(message = "Starting date must be a future date")
        LocalDateTime startingDate,
        @Future(message = "Ending date must be a future date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location
) {
}
