package dev.santiescobares.ubesweb.competition.event;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class CompetitionEvent extends LoggableEvent<Competition> {

    private final Competition competition;

    public CompetitionEvent(UUID userId, Competition competition, Action action) {
        super(userId, ResourceType.USER, competition.getId().toString(), action);
        this.competition = competition;
    }

    @Override
    public Competition getEntity() { return competition; }
}
