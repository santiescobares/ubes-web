package dev.santiescobares.ubesweb.competition.event.participant;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Participant;
import dev.santiescobares.ubesweb.competition.event.CompetitionEvent;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.Getter;

import java.util.UUID;

@Getter
public class CompetitionUpdateParticipantEvent extends CompetitionEvent {

    private final Participant participant;

    public CompetitionUpdateParticipantEvent(UUID userId, Competition competition, Participant participant) {
        super(userId, competition, Action.UPDATE);
        this.participant = participant;
    }
}
