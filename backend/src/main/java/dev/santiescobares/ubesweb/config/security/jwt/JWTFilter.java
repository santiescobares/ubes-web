package dev.santiescobares.ubesweb.config.security.jwt;

import com.auth0.jwt.interfaces.DecodedJWT;
import dev.santiescobares.ubesweb.auth.AuthService;
import dev.santiescobares.ubesweb.auth.token.TokenService;
import dev.santiescobares.ubesweb.context.RequestContextData;
import dev.santiescobares.ubesweb.context.RequestContextHolder;
import dev.santiescobares.ubesweb.enums.Role;
import dev.santiescobares.ubesweb.util.CookieUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.UUID;

import static dev.santiescobares.ubesweb.Global.*;

@Component
@RequiredArgsConstructor
public class JWTFilter extends OncePerRequestFilter {

    private final AuthService authService;
    private final TokenService tokenService;

    private final StringRedisTemplate redisTemplate;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String rawToken = CookieUtil.getCookie(request, ACCESS_TOKEN_COOKIE);
        if (SecurityContextHolder.getContext().getAuthentication() != null || rawToken == null) {
            filterChain.doFilter(request, response);
            return;
        }

        DecodedJWT accessToken = tokenService.decodeToken(rawToken);
        if (accessToken == null || redisTemplate.hasKey(REDIS_TOKEN_BLACKLIST_KEY + accessToken.getId())) {
            filterChain.doFilter(request, response);
            return;
        }

        String userId = accessToken.getClaim("userId").asString();
        String logoutTimestamp = redisTemplate.opsForValue().get(REDIS_FORCED_LOGOUT_KEY + userId);

        if (logoutTimestamp != null && accessToken.getIssuedAtAsInstant().toEpochMilli() < Long.parseLong(logoutTimestamp)) {
            authService.blacklistToken(rawToken);
            CookieUtil.clearHttpOnlyCookie(response, ACCESS_TOKEN_COOKIE);
        } else {
            Role role = Role.valueOf(accessToken.getClaim("role").asString());
            UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                    accessToken.getSubject(),
                    null,
                    Collections.singletonList(new SimpleGrantedAuthority(role.getAuthority().name()))
            );
            authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            SecurityContextHolder.getContext().setAuthentication(authToken);
            RequestContextHolder.setCurrentSession(new RequestContextData(
                    UUID.fromString(userId),
                    role,
                    accessToken.getSubject()
            ));
        }

        try {
            filterChain.doFilter(request, response);
        } finally {
            RequestContextHolder.clear();
        }
    }
}
