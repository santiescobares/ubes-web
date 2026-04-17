package dev.santiescobares.ubesweb.util;

import lombok.experimental.UtilityClass;

import java.util.UUID;

@UtilityClass
public final class RandomUtil {

    public String randomHexString() {
        return UUID.randomUUID().toString().replace("-", "");
    }
}
