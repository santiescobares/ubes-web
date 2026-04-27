package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.exception.ErrorCode;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ResourceAlreadyExistsException extends BackendException {

    private final ResourceType resourceType;

    public ResourceAlreadyExistsException(ResourceType resourceType) {
        super(
                "Resource of type " + resourceType + " already exists",
                String.format(ErrorCode.RESOURCE_ALREADY_EXISTS.toString(), resourceType.name()),
                HttpStatus.CONFLICT
        );
        this.resourceType = resourceType;
    }
}
