package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BackendException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus statusCode;

    public BackendException(String message, String errorCode, HttpStatus statusCode) {
        super(message);
        this.errorCode = errorCode;
        this.statusCode = statusCode;
    }

    public BackendException(String message, ErrorCode errorCode, HttpStatus statusCode) {
        this(message, errorCode.toString(), statusCode);
    }
}
