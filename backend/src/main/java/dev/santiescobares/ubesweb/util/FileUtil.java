package dev.santiescobares.ubesweb.util;

import lombok.experimental.UtilityClass;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.Collection;
import java.util.stream.Collectors;

@UtilityClass
public final class FileUtil {

    public void validateExtension(MultipartFile file, Collection<String> supportedExtensions) {
        String extension = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (extension == null) {
            throw new IllegalArgumentException("Invalid file extension");
        }
        if (!supportedExtensions.contains(extension.toLowerCase())) {
            throw new IllegalArgumentException("Supported file extensions: " + supportedExtensions
                    .stream()
                    .map(String::toUpperCase)
                    .collect(Collectors.joining(", "))
            );
        }
    }

    public void validateSize(long size, long maxSize) {
        if (size > maxSize) {
            throw new IllegalArgumentException("File size can't be greater than " + (maxSize / 1024 / 1024) + " MB");
        }
    }

    public void validateSize(MultipartFile file, long maxSize) {
        validateSize(file.getSize(), maxSize);
    }
}
