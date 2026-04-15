package dev.santiescobares.ubesweb.exception;

import java.time.Instant;

public record ExceptionResponseDTO(
        String traceId,
        String errorCode,
        String message,
        String path,
        Instant timestamp
) {
}
