package dev.santiescobares.ubesweb.log.dto;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.time.Instant;

public record LogDTO(
        Long id,
        Instant createdAt,
        ResourceType resourceType,
        String resourceId,
        Action action,
        String details
) {
}
