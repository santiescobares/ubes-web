package dev.santiescobares.ubesweb.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public enum Role {
    DEVELOPER(RoleAuthority.EXECUTIVE),
    PRESIDENT(RoleAuthority.EXECUTIVE),
    VICE_PRESIDENT(RoleAuthority.EXECUTIVE),
    SECRETARY(RoleAuthority.EXECUTIVE),
    PROSECRETARY(RoleAuthority.EXECUTIVE),
    TREASURER(RoleAuthority.EXECUTIVE),
    PRO_TREASURER(RoleAuthority.EXECUTIVE),
    SPORT_SECRETARY(RoleAuthority.COMPETITION),
    SPORT_PROSECRETARY(RoleAuthority.COMPETITION),
    CULTURE_SECRETARY(RoleAuthority.COMPETITION),
    CULTURE_PROSECRETARY(RoleAuthority.COMPETITION),
    ENV_SECRETARY(RoleAuthority.COMPETITION),
    ENV_PROSECRETARY(RoleAuthority.COMPETITION),
    PPRR_SECRETARY(RoleAuthority.PRESS),
    PPRR_PROSECRETARY(RoleAuthority.PRESS),
    PRESS_SECRETARY(RoleAuthority.PRESS),
    PRESS_PROSECRETARY(RoleAuthority.PRESS),
    IIRR_SECRETARY(RoleAuthority.NONE),
    IIRR_PROSECRETARY(RoleAuthority.NONE),
    ADMIN_SECRETARY(RoleAuthority.CANTEEN),
    ADMIN_PROSECRETARY(RoleAuthority.CANTEEN),
    USER(RoleAuthority.NONE);

    private final RoleAuthority authority;
}
