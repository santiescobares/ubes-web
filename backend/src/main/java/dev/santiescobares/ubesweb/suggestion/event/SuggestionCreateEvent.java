package dev.santiescobares.ubesweb.suggestion.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.suggestion.Suggestion;

import java.util.UUID;

public class SuggestionCreateEvent extends SuggestionEvent {

    public SuggestionCreateEvent(UUID userId, Suggestion suggestion) {
        super(userId, suggestion, Action.CREATE);
    }
}
