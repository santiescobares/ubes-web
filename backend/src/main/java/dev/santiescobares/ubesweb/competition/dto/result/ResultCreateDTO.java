package dev.santiescobares.ubesweb.competition.dto.result;

import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record ResultCreateDTO(
        @NotNull(message = "Position type is required")
        ParticipantPositionType positionType,
        @Positive(message = "Position number must be positive")
        int positionNumber,
        @NotBlank(message = "Name is required")
        @Size(max = 100, message = "Name is too long")
        String name,
        Long participantId
) {
}
