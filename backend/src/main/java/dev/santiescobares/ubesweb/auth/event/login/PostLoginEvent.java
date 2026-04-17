package dev.santiescobares.ubesweb.auth.event.login;

import dev.santiescobares.ubesweb.model.event.ServletEvent;
import dev.santiescobares.ubesweb.user.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.Getter;

@Getter
public class PostLoginEvent extends ServletEvent {

    private final User user;

    public PostLoginEvent(HttpServletRequest request, HttpServletResponse response, User user) {
        super(request, response);
        this.user = user;
    }
}
