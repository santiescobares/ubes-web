package dev.santiescobares.ubesweb.punishment.dto;

import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;

import java.time.Instant;
import java.time.LocalDateTime;

public record PunishmentDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        UserSnapshotDTO issuedOn,
        UserSnapshotDTO issuedBy,
        String reason,
        LocalDateTime expiresAt,
        boolean active,
        Instant removedAt,
        UserSnapshotDTO removedBy,
        String removeReason
) {
}
