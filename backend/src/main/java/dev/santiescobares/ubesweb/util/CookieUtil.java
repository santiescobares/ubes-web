package dev.santiescobares.ubesweb.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.experimental.UtilityClass;

import java.util.stream.Stream;

@UtilityClass
public final class CookieUtil {

    public String getCookie(HttpServletRequest request, String name) {
        if (request.getCookies() == null) return null;
        return Stream.of(request.getCookies())
                .filter(cookie -> cookie.getName().equals(name))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    public void setHttpOnlyCookie(HttpServletResponse response, String name, String token, long expiration) {
        response.setHeader(
                "Set-Cookie",
                String.format("%s=%s; HttpOnly; Secure; Max-Age=%d; Path=/; SameSite=Strict", name, token, expiration)
        );
    }

    public static void clearHttpOnlyCookie(HttpServletResponse response, String name) {
        response.setHeader(
                "Set-Cookie",
                String.format("%s=; HttpOnly; Secure; Max-Age=0; Path=/; SameSite=Strict", name)
        );
    }
}
