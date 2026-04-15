package dev.santiescobares.ubesweb.exception;

import dev.santiescobares.ubesweb.config.filter.LoggingFilter;
import dev.santiescobares.ubesweb.exception.type.BackendException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BackendException.class)
    public ResponseEntity<ExceptionResponseDTO> handleBackendException(BackendException e, HttpServletRequest request) {
        return buildResponse(e, e.getStatusCode(), e.getErrorCode(), e.getMessage(), request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ExceptionResponseDTO> handleGenericException(Exception e, HttpServletRequest request) {
        return buildResponse(e, HttpStatus.FORBIDDEN, ErrorCode.INVALID_OPERATION.toString(), e.getMessage(), request);
    }

    public static ResponseEntity<ExceptionResponseDTO> buildResponse(Exception e, HttpStatus status, String errorCode, String message,
            HttpServletRequest request) {
        String traceId = getOrCreateLogTraceId();

        if (status.is5xxServerError()) {
            log.error("Internal Server Error ({}): {}", status.value(), message, e);
        } else {
            log.warn("Client Error ({}): {}", status.value(), message);
        }

        return ResponseEntity.status(status)
                .body(new ExceptionResponseDTO(traceId, errorCode, message, request.getRequestURI(), Instant.now()));
    }

    private static String getOrCreateLogTraceId() {
        String mdcTraceId = MDC.get(LoggingFilter.TRACE_ID_KEY);
        if (mdcTraceId != null && !mdcTraceId.isBlank()) {
            return mdcTraceId;
        }
        return UUID.randomUUID().toString();
    }
}
