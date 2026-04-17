package dev.santiescobares.ubesweb.service;

import dev.santiescobares.ubesweb.exception.type.ThirdPartyException;
import dev.santiescobares.ubesweb.util.RandomUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.time.Duration;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    public String uploadFile(MultipartFile file, String bucket, String path, String name) {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("File can't be null or empty");
        }
        try {
            String key = path + name + "." + StringUtils.getFilenameExtension(file.getOriginalFilename());
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(bucket)
                            .key(key)
                            .contentType(file.getContentType())
                            .build(),
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize())
            );
            return key;
        } catch (IOException e) {
            log.error("An error ocurred while trying to upload a file to R2. {}", e.getMessage());
            throw new ThirdPartyException("An error ocurred while trying to upload a file to R2");
        }
    }

    public String uploadFile(MultipartFile file, String bucket, String path) {
        return uploadFile(file, bucket, path, RandomUtil.randomHexString());
    }

    public List<String> uploadFilesInParallel(List<MultipartFile> files, String bucket, String path) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }
        return files.parallelStream()
                .map(file -> uploadFile(file, bucket, path))
                .toList();
    }

    public String generateDownloadPresignedUrl(String bucket, String fileKey, Duration expiration) {
        return s3Presigner.presignGetObject(
                GetObjectPresignRequest.builder()
                        .signatureDuration(expiration)
                        .getObjectRequest(GetObjectRequest.builder()
                                .bucket(bucket)
                                .key(fileKey)
                                .build()
                        ).build()
        ).url().toString();
    }

    public String generateUploadPresignedUrl(String bucket, String fileKey, Duration expiration) {
        return s3Presigner.presignPutObject(
                PutObjectPresignRequest.builder()
                        .signatureDuration(expiration)
                        .putObjectRequest(PutObjectRequest.builder()
                                .bucket(bucket)
                                .key(fileKey)
                                .build()
                        ).build()
        ).url().toString();
    }
}
