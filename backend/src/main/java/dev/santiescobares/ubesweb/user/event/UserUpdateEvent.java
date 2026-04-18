package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;

import java.util.UUID;

public class UserUpdateEvent extends UserEvent {

    public UserUpdateEvent(UUID userId, User user) {
        super(userId, user, Action.UPDATE);
    }
}
