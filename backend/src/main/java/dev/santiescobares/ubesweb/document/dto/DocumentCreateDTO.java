package dev.santiescobares.ubesweb.document.dto;

import dev.santiescobares.ubesweb.document.enums.DocumentType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record DocumentCreateDTO(
        @NotBlank(message = "Name is required")
        @Size(max = 50, message = "Name is too long")
        String name,
        @NotNull(message = "Document type is required")
        DocumentType type
) {
}
