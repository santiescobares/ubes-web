package dev.santiescobares.ubesweb.document.dto;

import dev.santiescobares.ubesweb.document.enums.DocumentType;
import jakarta.validation.constraints.Size;

public record DocumentUpdateDTO(
        @Size(min = 1, max = 50, message = "Name is either too short or too long")
        String name,
        DocumentType type
) {
}
