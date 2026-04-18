package dev.santiescobares.ubesweb.event.event;

import dev.santiescobares.ubesweb.event.Event;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class EventCreateEvent extends EventAbstractEvent {

    public EventCreateEvent(UUID userId, Event event) {
        super(userId, event, Action.CREATE);
    }
}
