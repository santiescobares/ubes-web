package dev.santiescobares.ubesweb.competition.event.result;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.event.CompetitionEvent;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.Getter;

import java.util.UUID;

@Getter
public class CompetitionResultUpdateEvent extends CompetitionEvent {

    private final Result result;

    public CompetitionResultUpdateEvent(UUID userId, Competition competition, Result result) {
        super(userId, competition, Action.CREATE);
        this.result = result;
    }
}
