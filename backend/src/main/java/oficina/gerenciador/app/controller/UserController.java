package oficina.gerenciador.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import oficina.gerenciador.app.model.request.CreateUserRequest;
import oficina.gerenciador.app.model.response.UserResponse;
import oficina.gerenciador.app.service.UserService;
import oficina.gerenciador.app.util.AuthInterceptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping({"/users", "/usuarios"})
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping
    public ResponseEntity<UserResponse> createUser(
            @RequestBody CreateUserRequest request,
            HttpServletRequest httpRequest
    ) {
        String callerRole = (String) httpRequest.getAttribute(AuthInterceptor.ATRIBUTO_ROLE);
        UserResponse response = userService.createUser(request, callerRole);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<UserResponse>> listUsers(HttpServletRequest httpRequest) {
        String callerRole = (String) httpRequest.getAttribute(AuthInterceptor.ATRIBUTO_ROLE);
        return ResponseEntity.ok(userService.listUsers(callerRole));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}
