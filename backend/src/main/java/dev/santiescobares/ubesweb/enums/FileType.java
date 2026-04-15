package dev.santiescobares.ubesweb.enums;

import lombok.AllArgsConstructor;
import lombok.Getter;

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
}
