package dev.santiescobares.ubesweb.util;

import lombok.experimental.UtilityClass;

import java.text.Normalizer;

@UtilityClass
public final class StringUtil {

    public String normalize(String text) {
        return Normalizer.normalize(text, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
                .replaceAll("[^a-zA-Z0-9\\s]", "")
                .trim()
                .replaceAll("\\s+", "-")
                .toLowerCase();
    }
}
