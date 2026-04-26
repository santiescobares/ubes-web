package dev.santiescobares.ubesweb.competition.event.result;

import dev.santiescobares.ubesweb.competition.entity.Competition;
import dev.santiescobares.ubesweb.competition.entity.Result;
import dev.santiescobares.ubesweb.competition.event.CompetitionEvent;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
public class CompetitionResultsCalculatedEvent extends CompetitionEvent {

    private final List<Result> results;

    public CompetitionResultsCalculatedEvent(UUID userId, Competition competition, List<Result> results) {
        super(userId, competition, Action.CREATE);
        this.results = results;
    }
}
