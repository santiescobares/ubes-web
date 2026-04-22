package dev.santiescobares.ubesweb.competition.dto;

import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record CompetitionCreateDTO(
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name is too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @NotNull(message = "Starting date is required")
        @FutureOrPresent(message = "Starting date must be a future or present date")
        LocalDateTime startingDate,
        @NotNull(message = "Ending date is required")
        @FutureOrPresent(message = "Ending date must be a future or present date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location,
        @Positive(message = "Minimum participants per school must be positive")
        int minParticipants,
        @Positive(message = "Maximum participants per school must be positive")
        int maxParticipants,
        boolean requiresShirtNumbers,
        boolean requiresMedicalCertificates
) {
}
