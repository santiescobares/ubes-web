package dev.santiescobares.ubesweb.auth.event.logout;

import dev.santiescobares.ubesweb.model.event.ServletEvent;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class PostLogoutEvent extends ServletEvent {

    public PostLogoutEvent(HttpServletRequest request, HttpServletResponse response) {
        super(request, response);
    }
}
