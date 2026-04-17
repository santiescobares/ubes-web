package dev.santiescobares.ubesweb.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum RoleAuthority {
    EXECUTIVE(4),
    COMPETITION(3),
    PRESS(3),
    CANTEEN(3),
    DELEGATE(2),
    NONE(1);

    private final int weight;

    public boolean surpasses(RoleAuthority other) {
        return weight > other.weight;
    }
}
