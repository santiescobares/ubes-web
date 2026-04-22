package dev.santiescobares.ubesweb.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.stream.Stream;

@Getter
@AllArgsConstructor
public enum FileType {
    PDF("pdf"),
    WORD("doc"),
    WORDX("docx"),
    EXCEL("xls"),
    EXCELX("xlsx"),
    PNG("png"),
    JPG("jpg"),
    JPEG("jpeg");

    private final String extensionName;

    public static FileType getByExtensionName(String extensionName) {
        return Stream.of(values())
                .filter(fileType -> fileType.extensionName.equals(extensionName)).findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid extension name"));
    }
}
