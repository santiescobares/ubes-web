package dev.santiescobares.ubesweb.document.event;

import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class DocumentDeleteEvent extends DocumentEvent {

    public DocumentDeleteEvent(UUID userId, Document document) {
        super(userId, document, Action.DELETE);
    }
}
