package dev.santiescobares.ubesweb.auth.token;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import dev.santiescobares.ubesweb.exception.type.BackendException;
import org.springframework.http.HttpStatus;

public class TokenException extends BackendException {

    public TokenException(String message) {
        super(message, ErrorCode.INVALID_TOKEN, HttpStatus.FORBIDDEN);
    }
}
