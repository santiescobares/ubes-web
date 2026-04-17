package dev.santiescobares.ubesweb.config.security.jwt;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import dev.santiescobares.ubesweb.exception.GlobalExceptionHandler;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
public class JWTEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException exception) throws IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.getWriter().write(new ObjectMapper().writeValueAsString(GlobalExceptionHandler.buildResponse(
                null,
                HttpStatus.UNAUTHORIZED,
                ErrorCode.UNAUTHORIZED_OPERATION.toString(),
                exception.getMessage(),
                request
        )));
    }
}
