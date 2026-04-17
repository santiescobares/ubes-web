package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;

public class UserCreateEvent extends UserEvent {

    public UserCreateEvent(User user) {
        super(user, Action.CREATE);
    }
}
