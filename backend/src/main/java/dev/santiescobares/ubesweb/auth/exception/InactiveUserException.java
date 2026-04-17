package dev.santiescobares.ubesweb.auth.exception;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import dev.santiescobares.ubesweb.exception.type.BackendException;
import org.springframework.http.HttpStatus;

public class InactiveUserException extends BackendException {

    public InactiveUserException(String message) {
        super(message, ErrorCode.INACTIVE_USER, HttpStatus.FORBIDDEN);
    }
}
