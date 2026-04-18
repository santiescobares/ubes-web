package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.user.User;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class UserEvent extends LoggableEvent<User> {

    private final User user;

    public UserEvent(UUID userId, User user, Action action) {
        super(userId, ResourceType.USER, user.getId().toString(), action);
        this.user = user;
    }

    @Override
    public User getEntity() { return user; }
}
