package dev.santiescobares.ubesweb.service;

import dev.santiescobares.ubesweb.exception.type.ThirdPartyException;
import dev.santiescobares.ubesweb.util.RandomUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
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
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;
import java.util.stream.IntStream;

@Slf4j
@Service
public class StorageService {

    private final S3Client s3Client;
    private final S3Presigner s3Presigner;

    private final Executor parallelUploadExecutor;

    public StorageService(
            S3Client s3Client,
            S3Presigner s3Presigner,
            @Qualifier("parallelUploadExecutor") Executor parallelUploadExecutor
    ) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
        this.parallelUploadExecutor = parallelUploadExecutor;
    }

    public String uploadFile(MultipartFile file, String bucket, String key) {
        if (file.isEmpty() || file.getOriginalFilename() == null) {
            throw new IllegalArgumentException("File can't be null or empty");
        }
        try {
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

    public String uploadFile(MultipartFile file, String bucket, String path, String name) {
        return uploadFile(file, bucket, fileName(file, path, name));
    }

    public String uploadRandomFile(MultipartFile file, String bucket, String path) {
        return uploadFile(file, bucket, fileName(file, path));
    }

    public List<String> uploadFilesInParallel(List<MultipartFile> files, String bucket, String path) {
        List<CompletableFuture<String>> futures = files.stream()
                .map(file -> CompletableFuture.supplyAsync(() -> uploadFile(file, bucket, path), parallelUploadExecutor))
                .toList();
        return futures.stream()
                .map(CompletableFuture::join)
                .toList();
    }

    public void uploadFilesInParallel(List<MultipartFile> files, String bucket, List<String> keys) {
        if (files.size() != keys.size()) {
            throw new IllegalArgumentException("Files size and keys size must be equal");
        }
        List<CompletableFuture<String>> futures = IntStream.range(0, files.size())
                .mapToObj(i -> CompletableFuture.supplyAsync(
                        () -> uploadFile(files.get(i), bucket, keys.get(i)),
                        parallelUploadExecutor
                ))
                .toList();
        CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();
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

    public static String fileName(MultipartFile file, String path, String name) {
        return path + name + StringUtils.getFilenameExtension(file.getOriginalFilename());
    }

    public static String fileName(MultipartFile file, String path) {
        return path + RandomUtil.randomHexString() + "." + StringUtils.getFilenameExtension(file.getOriginalFilename());
    }
}
