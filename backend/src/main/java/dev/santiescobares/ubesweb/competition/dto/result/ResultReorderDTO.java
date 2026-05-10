package dev.santiescobares.ubesweb.competition.dto.result;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.util.List;

public record ResultReorderDTO(
        @NotEmpty(message = "Entries are required")
        List<@Valid ResultOrderEntry> entries
) {
    public record ResultOrderEntry(
            @NotNull(message = "Result id is required")
            Long id,
            @Positive(message = "Position number must be positive")
            int positionNumber
    ) {}
}
