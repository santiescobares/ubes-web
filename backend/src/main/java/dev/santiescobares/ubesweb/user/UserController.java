package dev.santiescobares.ubesweb.user;

import dev.santiescobares.ubesweb.Global;
import dev.santiescobares.ubesweb.user.dto.UserCreateDTO;
import dev.santiescobares.ubesweb.user.dto.UserDTO;
import dev.santiescobares.ubesweb.user.dto.UserPictureDTO;
import dev.santiescobares.ubesweb.user.dto.UserUpdateDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@RestController
@RequestMapping(Global.BASE_URL + "/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping
    public ResponseEntity<UserDTO> createUser(@RequestBody @Valid UserCreateDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.createUser(dto));
    }

    @PutMapping
    public ResponseEntity<UserDTO> updateUser(
            @RequestParam(name = "id", required = false) UUID id,
            @RequestBody @Valid UserUpdateDTO dto
    ) {
        return ResponseEntity.ok(userService.updateUser(id, dto));
    }

    @PatchMapping(value = "/picture", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UserPictureDTO> updateUserPicture(
            @RequestParam(name = "id", required = false) UUID id,
            @RequestPart(value = "pictureFile", required = false) MultipartFile pictureFile
    ) {
        return ResponseEntity.ok(userService.updateUserPicture(id, pictureFile));
    }

    @DeleteMapping
    public ResponseEntity<Void> deleteUser(HttpServletRequest request, HttpServletResponse response) {
        userService.deleteUser(request, response);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<UserDTO> getUser(@RequestParam(name = "id", required = false) UUID id) {
        return ResponseEntity.ok(userService.getUserDTO(id));
    }
}
