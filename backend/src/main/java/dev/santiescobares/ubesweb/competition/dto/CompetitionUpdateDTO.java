package dev.santiescobares.ubesweb.competition.dto;

import dev.santiescobares.ubesweb.model.location.LocationDTO;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record CompetitionUpdateDTO(
        @Size(min = 1, max = 50, message = "Name is either too short or too long")
        String name,
        @Size(max = 1000, message = "Description is too long")
        String description,
        @Future(message = "Starting date must be a future date")
        LocalDateTime startingDate,
        @Future(message = "Ending date must be a future date")
        LocalDateTime endingDate,
        @Valid
        LocationDTO location,
        @Min(value = 0, message = "Min participants per school must be between 0 and 99")
        @Max(value = 99, message = "Min participants per school must be between 0 and 99")
        Integer minParticipants,
        @Min(value = 1, message = "Max participants per school must be between 1 and 99")
        @Max(value = 99, message = "Max participants per school must be between 1 and 99")
        Integer maxParticipants,
        @Min(value = 0, message = "Max coaches per school must be between 0 and 99")
        @Max(value = 99, message = "Max coaches per school must be between 0 and 99")
        Integer maxCoaches,
        Boolean requiresShirtNumbers,
        Boolean requiresMedicalCertificates
) {
}
