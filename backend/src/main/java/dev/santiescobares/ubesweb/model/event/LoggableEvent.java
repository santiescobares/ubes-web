package dev.santiescobares.ubesweb.model.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public abstract class LoggableEvent<T> {

    private final UUID userId;
    private final ResourceType resourceType;
    private final String resourceId;
    private final Action action;

    public abstract T getEntity();
}
