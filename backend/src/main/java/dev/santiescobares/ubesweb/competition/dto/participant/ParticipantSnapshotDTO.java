package dev.santiescobares.ubesweb.competition.dto.participant;

import dev.santiescobares.ubesweb.competition.enums.ParticipantRole;
import dev.santiescobares.ubesweb.enums.School;

public record ParticipantSnapshotDTO(
        Long id,
        ParticipantRole role,
        String firstName,
        String lastName,
        School school,
        int shirtNumber
) {
}
