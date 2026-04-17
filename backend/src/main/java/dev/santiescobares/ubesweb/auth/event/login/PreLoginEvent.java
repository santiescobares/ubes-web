package dev.santiescobares.ubesweb.auth.event.login;

import dev.santiescobares.ubesweb.model.event.ServletEvent;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

public class PreLoginEvent extends ServletEvent {

    public PreLoginEvent(HttpServletRequest request, HttpServletResponse response) {
        super(request, response);
    }
}
