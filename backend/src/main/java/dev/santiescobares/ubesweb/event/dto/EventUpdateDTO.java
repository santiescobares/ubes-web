package dev.santiescobares.ubesweb.event.dto;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record EventUpdateDTO(
        EventType type,
        @Size(max = 50, message = "Name is too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @FutureOrPresent(message = "Starting date must be a future or present date")
        LocalDateTime startingDate,
        @FutureOrPresent(message = "Ending date must be a future or present date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location
) {
}
