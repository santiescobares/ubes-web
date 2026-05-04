package dev.santiescobares.ubesweb.context;

import dev.santiescobares.ubesweb.enums.RoleAuthority;
import dev.santiescobares.ubesweb.exception.type.InvalidOperationException;
import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public final class RequestContextUtil {

    public void checkUserAuthorityOver(UUID targetId, String errorMessage, RoleAuthority atLeast) {
        RequestContextData contextData = RequestContextHolder.getCurrentSession();
        if (contextData == null) {
            throw new IllegalStateException("No user loaded in current context");
        }
        if (!contextData.userId().equals(targetId) && !contextData.role().getAuthority().isAtLeast(atLeast)) {
            throw new InvalidOperationException(errorMessage);
        }
    }
}
