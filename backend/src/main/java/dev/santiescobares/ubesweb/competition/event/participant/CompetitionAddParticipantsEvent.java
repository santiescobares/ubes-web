package dev.santiescobares.ubesweb.competition.event.participant;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.event.CompetitionEvent;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
public class CompetitionAddParticipantsEvent extends CompetitionEvent {

    private final List<Participant> addedParticipants;

    public CompetitionAddParticipantsEvent(UUID userId, Competition competition, List<Participant> addedParticipants) {
        super(userId, competition, Action.CREATE);
        this.addedParticipants = addedParticipants;
    }
}
