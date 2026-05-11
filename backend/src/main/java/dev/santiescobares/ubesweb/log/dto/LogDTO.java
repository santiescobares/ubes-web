package dev.santiescobares.ubesweb.log.dto;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;

import java.time.Instant;

public record LogDTO(
        Long id,
        Instant createdAt,
        UserSnapshotDTO user,
        ResourceType resourceType,
        String resourceId,
        Action action,
        String details
) {
}
