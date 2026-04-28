package dev.santiescobares.ubesweb.punishment.event;

import dev.santiescobares.ubesweb.log.enums.Action;
import dev.santiescobares.ubesweb.punishment.Punishment;

import java.util.UUID;

public class PunishmentRemoveEvent extends PunishmentEvent {

    public PunishmentRemoveEvent(UUID userId, Punishment punishment) {
        super(userId, punishment, Action.REMOVE);
    }
}
