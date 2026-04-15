package dev.santiescobares.ubesweb.exception;

public enum ErrorCode {
    INVALID_OPERATION,
    RESOURCE_NOT_FOUND,
    RESOURCE_ALREADY_EXISTS;

    @Override
    public String toString() {
        return switch (this) {
            case RESOURCE_NOT_FOUND -> "RESOURCE_%s%_NOT_FOUND";
            case RESOURCE_ALREADY_EXISTS -> "RESOURCE_%s%_ALREADY_EXISTS";
            default -> name();
        };
    }
}
