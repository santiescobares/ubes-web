package dev.santiescobares.ubesweb.punishment.event;

import dev.santiescobares.ubesweb.enums.ResourceType;
import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.model.event.LoggableEvent;
import dev.santiescobares.ubesweb.punishment.Punishment;
import lombok.Getter;

import java.util.UUID;

@Getter
public abstract class PunishmentEvent extends LoggableEvent<Punishment> {

    private final Punishment punishment;

    public PunishmentEvent(UUID userId, Punishment punishment, Action action) {
        super(userId, ResourceType.USER, punishment.getId().toString(), action);
        this.punishment = punishment;
    }

    @Override
    public Punishment getEntity() { return punishment; }
}
