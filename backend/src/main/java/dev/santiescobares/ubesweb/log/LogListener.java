package dev.santiescobares.ubesweb.log;

import dev.santiescobares.ubesweb.auth.event.login.PostLoginEvent;
import dev.santiescobares.ubesweb.auth.event.logout.PostLogoutEvent;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.user.User;
import dev.santiescobares.ubesweb.user.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class LogListener {

    private final UserService userService;
    private final LogService logService;

    @EventListener
    public void onLoggableEvent(LoggableEvent<?> event) {
        logService.createLog(
                event.getUserId(),
                event.getResourceType(),
                event.getResourceId(),
                event.getAction(),
                event.getEntity().toString()
        );
    }

    @EventListener
    public void onUserLogIn(PostLoginEvent event) {
        // TODO add ip address as detail
        logService.createLog(event.getUser().getId(), ResourceType.USER, event.getUser().getId().toString(), Action.LOG_IN, null);
    }

    @EventListener
    public void onUserLogOut(PostLogoutEvent event) {
        User user = userService.getCurrentUser();
        // TODO add ip address as detail
        logService.createLog(user.getId(), ResourceType.USER, user.getId().toString(), Action.LOG_OUT, null);
    }
}
