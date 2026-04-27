package dev.santiescobares.ubesweb.suggestion.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.suggestion.Suggestion;

import java.util.UUID;

public class SuggestionUpdateEvent extends SuggestionEvent {

    public SuggestionUpdateEvent(UUID userId, Suggestion suggestion) {
        super(userId, suggestion, Action.UPDATE);
    }
}
