package dev.santiescobares.ubesweb.suggestion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SuggestionCreateDTO(
        @NotBlank(message = "Content is required")
        @Size(min = 10, max = 1000, message = "Content is either too short or too long")
        String content,
        boolean anonymized
) {
}
