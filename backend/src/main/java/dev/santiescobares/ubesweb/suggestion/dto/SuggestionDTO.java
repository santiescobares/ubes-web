package dev.santiescobares.ubesweb.suggestion.dto;

import dev.santiescobares.ubesweb.user.dto.UserSnapshotDTO;

import java.time.Instant;

public record SuggestionDTO(
        Long id,
        Instant createdAt,
        Instant updatedAt,
        UserSnapshotDTO createdBy,
        String content,
        boolean anonymized,
        int totalVotes,
        int votesInFavor,
        Boolean userVote,
        boolean hidden
) {
}
