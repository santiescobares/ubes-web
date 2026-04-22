package dev.santiescobares.ubesweb.competition.dto.result;

import dev.santiescobares.ubesweb.competition.dto.participant.ParticipantSnapshotDTO;
import dev.santiescobares.ubesweb.competition.enums.ParticipantPositionType;

public record ResultDTO(
        ParticipantPositionType positionType,
        Integer positionNumber,
        String name,
        int points,
        ParticipantSnapshotDTO participant
) {
}
