package dev.santiescobares.ubesweb.context;

import dev.santiescobares.ubesweb.enums.RoleAuthority;

public final class RequestContextHolder {

    private static final ThreadLocal<RequestContextData> currentSession = new ThreadLocal<>();

    public static void setCurrentSession(RequestContextData data) {
        currentSession.set(data);
    }

    public static RequestContextData getCurrentSession() {
        return currentSession.get();
    }

    public static boolean hasAuthority(RoleAuthority... any) {
        RequestContextData contextData = getCurrentSession();
        if (contextData != null) {
            for (RoleAuthority roleAuthority : any) {
                if (roleAuthority == contextData.role().getAuthority()) return true;
            }
        }
        return false;
    }

    public static void clear() {
        currentSession.remove();
    }
}
