package dev.santiescobares.ubesweb.exception;

public enum ErrorCode {
    INVALID_OPERATION,
    UNAUTHORIZED_OPERATION,
    INVALID_ARGUMENT,
    RESOURCE_NOT_FOUND,
    RESOURCE_ALREADY_EXISTS,
    THIRD_PARTY_EXCEPTION,
    INVALID_TOKEN,
    INACTIVE_USER;

    @Override
    public String toString() {
        return switch (this) {
            case RESOURCE_NOT_FOUND -> "RESOURCE_%s%_NOT_FOUND";
            case RESOURCE_ALREADY_EXISTS -> "RESOURCE_%s%_ALREADY_EXISTS";
            default -> name();
        };
    }
}
