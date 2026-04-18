package dev.santiescobares.ubesweb.event.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.event.Event;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class EventAbstractEvent extends LoggableEvent<Event> {

    private final Event event;

    public EventAbstractEvent(UUID userId, Event event, Action action) {
        super(userId, ResourceType.EVENT, event.getId().toString(), action);
        this.event = event;
    }

    @Override
    public Event getEntity() { return event; }
}
