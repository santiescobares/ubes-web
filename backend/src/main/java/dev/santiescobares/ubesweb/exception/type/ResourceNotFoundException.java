package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ResourceNotFoundException extends BackendException {

    private final ResourceType resourceType;

    public ResourceNotFoundException(ResourceType resourceType) {
        super(
                "Resource of type " + resourceType + " not found",
                String.format(ErrorCode.RESOURCE_NOT_FOUND.toString(), resourceType.name()),
                HttpStatus.NOT_FOUND
        );
        this.resourceType = resourceType;
    }
}
