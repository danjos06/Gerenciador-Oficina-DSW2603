package oficina.gerenciador.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import oficina.gerenciador.app.model.request.LoginRequest;
import oficina.gerenciador.app.model.response.LoginResponse;
import oficina.gerenciador.app.model.response.UsuarioResponse;
import oficina.gerenciador.app.service.AuthService;
import oficina.gerenciador.app.service.UsuarioService;
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
    private final UsuarioService usuarioService;

    public AuthController(AuthService authService, UsuarioService usuarioService) {
        this.authService = authService;
        this.usuarioService = usuarioService;
    }

    @PostMapping({"/auth/login", "/login"})
    public ResponseEntity<LoginResponse> login(@RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/auth/me")
    public ResponseEntity<UsuarioResponse> me(HttpServletRequest request) {
        Integer usuarioId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        if (usuarioId == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Não autenticado");
        }
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorId(usuarioId));
    }
}
