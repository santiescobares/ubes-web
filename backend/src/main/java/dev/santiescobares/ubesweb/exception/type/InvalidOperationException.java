package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class InvalidOperationException extends BackendException {

    public InvalidOperationException(String message) {
        super(message, ErrorCode.INVALID_OPERATION, HttpStatus.FORBIDDEN);
    }
}
