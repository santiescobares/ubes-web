package dev.santiescobares.ubesweb.post;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.post.dto.PostCreateDTO;
import dev.santiescobares.ubesweb.post.dto.PostDTO;
import dev.santiescobares.ubesweb.post.dto.PostUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping(Global.BASE_URL + "/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<PostDTO> createPost(
            @RequestPart("body") @Valid PostCreateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(postService.createPost(dto, bannerFile));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<PostDTO> updatePost(
            @PathVariable Long id,
            @RequestPart("body") @Valid PostUpdateDTO dto,
            @RequestPart(value = "bannerFile", required = false) MultipartFile bannerFile,
            @RequestParam(name = "removeBanner", required = false) Boolean removeBanner
    ) {
        return ResponseEntity.ok(postService.updatePost(id, dto, bannerFile, removeBanner));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('EXECUTIVE', 'PRESS')")
    public ResponseEntity<Void> deletePost(@PathVariable Long id) {
        postService.deletePost(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/slug/{slug}")
    public ResponseEntity<PostDTO> getPostBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(postService.getPostDTOBySlug(slug));
    }

    @GetMapping
    public ResponseEntity<Page<PostDTO>> getPosts(
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        return ResponseEntity.ok(postService.getPostDTOs(pageable));
    }
}
