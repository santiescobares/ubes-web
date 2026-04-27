package dev.santiescobares.ubesweb.post.dto;

import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;

import java.time.Instant;

public record PostDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        UserSnapshotDTO createdBy,
        String title,
        String body,
        String bannerURL
) {
}
