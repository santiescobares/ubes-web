package dev.santiescobares.ubesweb.user.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;

@Getter
public class UserDeleteEvent extends UserEvent {

    private final HttpServletRequest request;
    private final HttpServletResponse response;

    public UserDeleteEvent(User user, HttpServletRequest request, HttpServletResponse response) {
        super(user, Action.DELETE);
        this.request = request;
        this.response = response;
    }
}
