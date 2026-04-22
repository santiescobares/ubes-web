package dev.santiescobares.ubesweb.document.dto;

import dev.santiescobares.ubesweb.document.enums.DocumentType;
import dev.santiescobares.ubesweb.enums.FileType;

import java.time.Instant;

public record DocumentDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        String name,
        DocumentType type,
        FileType fileType,
        long size,
        String url
) {
}
