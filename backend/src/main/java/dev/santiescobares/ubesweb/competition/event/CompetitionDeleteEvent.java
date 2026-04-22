package dev.santiescobares.ubesweb.competition.event;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class CompetitionDeleteEvent extends CompetitionEvent {

    public CompetitionDeleteEvent(UUID userId, Competition competition) {
        super(userId, competition, Action.DELETE);
    }
}
