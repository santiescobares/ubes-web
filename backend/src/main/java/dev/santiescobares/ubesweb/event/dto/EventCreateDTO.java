package dev.santiescobares.ubesweb.event.dto;

import dev.santiescobares.ubesweb.event.enums.EventType;
import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record EventCreateDTO(
        @NotNull(message = "Type is required")
        EventType type,
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name is too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @NotNull(message = "Starting date is required")
        @Future(message = "Starting date must be a future date")
        LocalDateTime startingDate,
        @NotNull(message = "Ending date is required")
        @Future(message = "Ending date must be a future date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location
) {
}
