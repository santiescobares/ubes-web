package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.exception.ErrorCode;
import org.springframework.http.HttpStatus;

public class ThirdPartyException extends BackendException {

    public ThirdPartyException(String message) {
        super(message, ErrorCode.THIRD_PARTY_EXCEPTION, HttpStatus.BAD_REQUEST);
    }
}
