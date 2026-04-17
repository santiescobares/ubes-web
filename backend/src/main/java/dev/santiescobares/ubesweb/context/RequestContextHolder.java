package dev.santiescobares.ubesweb.context;

public final class RequestContextHolder {

    private static final ThreadLocal<RequestContextData> currentSession = new ThreadLocal<>();

    public static void setCurrentSession(RequestContextData data) {
        currentSession.set(data);
    }

    public static RequestContextData getCurrentSession() {
        return currentSession.get();
    }

    public static void clear() {
        currentSession.remove();
    }
}
