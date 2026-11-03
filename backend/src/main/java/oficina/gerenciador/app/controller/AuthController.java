package oficina.gerenciador.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import oficina.gerenciador.app.model.request.LoginRequest;
import oficina.gerenciador.app.model.response.LoginResponse;
import oficina.gerenciador.app.model.response.UserResponse;
import oficina.gerenciador.app.service.AuthService;
import oficina.gerenciador.app.service.UserService;
import oficina.gerenciador.app.util.AuthInterceptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    public AuthController(AuthService authService, UserService userService) {
        this.authService = authService;
        this.userService = userService;
    }

    @PostMapping({"/auth/login", "/login"})
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UserResponse> me(HttpServletRequest request) {
        Integer usuarioId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado");
        }
        return ResponseEntity.ok(userService.getUserById(usuarioId));
    }
}
