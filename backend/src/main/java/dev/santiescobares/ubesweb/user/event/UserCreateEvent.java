package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;

import java.util.UUID;

public class UserCreateEvent extends UserEvent {

    public UserCreateEvent(UUID userId, User user) {
        super(userId, user, Action.CREATE);
    }
}
