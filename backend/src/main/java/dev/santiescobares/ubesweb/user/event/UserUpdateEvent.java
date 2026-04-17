package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;

public class UserUpdateEvent extends UserEvent {

    public UserUpdateEvent(User user) {
        super(user, Action.UPDATE);
    }
}
