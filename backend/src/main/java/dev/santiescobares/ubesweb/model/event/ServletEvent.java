package dev.santiescobares.ubesweb.model.event;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public abstract class ServletEvent {

    private final HttpServletRequest request;
    private final HttpServletResponse response;
}
