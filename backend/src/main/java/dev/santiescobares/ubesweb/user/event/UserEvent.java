package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.user.User;
import lombok.Getter;

@Getter
public abstract class UserEvent extends LoggableEvent<User> {

    private final User user;

    public UserEvent(User user, Action action) {
        super(user, ResourceType.USER, user.getId().toString(), action);
        this.user = user;
    }

    @Override
    public User getEntity() { return user; }
}
