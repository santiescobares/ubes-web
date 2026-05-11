package dev.santiescobares.ubesweb.competition.dto.result;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantSnapshotDTO;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;

public record ResultDTO(
        Long id,
        ParticipantPositionType positionType,
        int positionNumber,
        String name,
        int points,
        ParticipantSnapshotDTO participant
) {
}
