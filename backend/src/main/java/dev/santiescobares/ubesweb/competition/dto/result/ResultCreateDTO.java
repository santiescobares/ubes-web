package dev.santiescobares.ubesweb.competition.dto.result;

import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import jakarta.validation.constraints.*;

public record ResultCreateDTO(
        @NotNull(message = "Position type is required")
        ParticipantPositionType positionType,
        @Positive(message = "Position number must be a positive number")
        int positionNumber,
        @NotBlank(message = "Name is required")
        @Size(min = 3, max = 100, message = "Name is either too short or too long")
        String name,
        Long participantId
) {
}
