package dev.santiescobares.ubesweb.event.event;

import dev.santiescobares.ubesweb.event.Event;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class EventDeleteEvent extends EventAbstractEvent {

    public EventDeleteEvent(UUID userId, Event event) {
        super(userId, event, Action.DELETE);
    }
}
