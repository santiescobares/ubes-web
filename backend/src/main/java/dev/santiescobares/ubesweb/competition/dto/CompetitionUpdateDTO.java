package dev.santiescobares.ubesweb.competition.dto;

import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record CompetitionUpdateDTO(
        @Size(max = 50, message = "Name is too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @FutureOrPresent(message = "Starting date must be a future or present date")
        LocalDateTime startingDate,
        @FutureOrPresent(message = "Ending date must be a future or present date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location,
        @Positive(message = "Minimum participants per school must be positive")
        Integer minParticipants,
        @Positive(message = "Maximum participants per school must be positive")
        Integer maxParticipants,
        Boolean requiresShirtNumbers,
        Boolean requiresMedicalCertificates
) {
}
