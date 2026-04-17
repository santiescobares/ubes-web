package dev.santiescobares.ubesweb.model.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public abstract class LoggableEvent<T> {

    private final User user;
    private final ResourceType resourceType;
    private final String resourceId;
    private final Action action;

    public abstract T getEntity();
}
