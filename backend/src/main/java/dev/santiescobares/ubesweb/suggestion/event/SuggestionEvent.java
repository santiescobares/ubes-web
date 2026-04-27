package dev.santiescobares.ubesweb.suggestion.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.suggestion.Suggestion;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class SuggestionEvent extends LoggableEvent<Suggestion> {

    private final Suggestion suggestion;

    public SuggestionEvent(UUID userId, Suggestion suggestion, Action action) {
        super(userId, ResourceType.USER, suggestion.getId().toString(), action);
        this.suggestion = suggestion;
    }

    @Override
    public Suggestion getEntity() { return suggestion; }
}
