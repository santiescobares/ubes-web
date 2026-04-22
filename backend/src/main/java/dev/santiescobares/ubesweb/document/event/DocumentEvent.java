package dev.santiescobares.ubesweb.document.event;

import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class DocumentEvent extends LoggableEvent<Document> {

    private final Document document;

    public DocumentEvent(UUID userId, Document document, Action action) {
        super(userId, ResourceType.USER, document.getId().toString(), action);
        this.document = document;
    }

    @Override
    public Document getEntity() { return document; }
}
