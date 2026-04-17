package dev.santiescobares.ubesweb.auth;

import dev.santiescobares.ubesweb.user.event.UserDeleteEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AuthListener {

    private final AuthService authService;

    @EventListener
    public void logoutUserAfterAccountDeletion(UserDeleteEvent event) {
        authService.clearAccessToken(event.getRequest(), event.getResponse());
    }
}
