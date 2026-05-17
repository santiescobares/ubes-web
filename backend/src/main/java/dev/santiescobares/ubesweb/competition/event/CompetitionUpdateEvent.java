package dev.santiescobares.ubesweb.competition.event;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class CompetitionUpdateEvent extends CompetitionEvent {

    public CompetitionUpdateEvent(UUID userId, Competition competition) {
        super(userId, ResourceType.COMPETITION, competition, Action.UPDATE);
    }
}
