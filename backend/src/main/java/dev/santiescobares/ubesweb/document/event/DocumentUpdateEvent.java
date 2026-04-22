package dev.santiescobares.ubesweb.document.event;

import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class DocumentUpdateEvent extends DocumentEvent {

    public DocumentUpdateEvent(UUID userId, Document document) {
        super(userId, document, Action.UPDATE);
    }
}
