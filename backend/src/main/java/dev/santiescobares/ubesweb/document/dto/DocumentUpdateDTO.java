package dev.santiescobares.ubesweb.document.dto;

import dev.santiescobares.ubesweb.document.enums.DocumentType;
import jakarta.validation.constraints.Size;

public record DocumentUpdateDTO(
        @Size(max = 50, message = "Name is too long")
        String name,
        DocumentType type
) {
}
