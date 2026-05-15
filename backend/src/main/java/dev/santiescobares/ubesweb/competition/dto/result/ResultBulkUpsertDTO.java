package dev.santiescobares.ubesweb.competition.dto.result;

import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;
import dev.santiescobares.ubesweb.enums.School;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ResultBulkUpsertDTO(
        @NotNull(message = "Items list is required")
        @Valid
        List<Item> items
) {
    public record Item(
            Long id,
            @NotNull(message = "Position type is required")
            ParticipantPositionType positionType,
            @Positive(message = "Position number must be a positive number")
            int positionNumber,
            @NotBlank(message = "Name is required")
            @Size(min = 3, max = 100, message = "Name is either too short or too long")
            String name,
            Long participantId,
            School school
    ) {
    }
}
