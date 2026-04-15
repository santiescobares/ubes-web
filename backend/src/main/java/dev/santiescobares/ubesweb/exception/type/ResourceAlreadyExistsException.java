package dev.santiescobares.ubesweb.exception.type;

import dev.santiescobares.ubesweb.enums.ResourceType;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ResourceAlreadyExistsException extends BackendException {

    private final ResourceType resourceType;

    public ResourceAlreadyExistsException(ResourceType resourceType) {
        super(
                "Resource of type " + resourceType + " already exists",
                String.format(resourceType.toString(), resourceType.name()),
                HttpStatus.CONFLICT
        );
        this.resourceType = resourceType;
    }
}
