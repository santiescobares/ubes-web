package dev.santiescobares.ubesweb.document.event;

import dev.santiescobares.ubesweb.document.Document;
import dev.santiescobares.ubesweb.log.enums.Action;

import java.util.UUID;

public class DocumentCreateEvent extends DocumentEvent {

    public DocumentCreateEvent(UUID userId, Document document) {
        super(userId, document, Action.CREATE);
    }
}
