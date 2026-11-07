package oficina.gerenciador.app.controller;

import jakarta.servlet.http.HttpServletRequest;
import oficina.gerenciador.app.model.request.CriarUsuarioRequest;
import oficina.gerenciador.app.model.response.UsuarioResponse;
import oficina.gerenciador.app.service.UsuarioService;
import oficina.gerenciador.app.util.AuthInterceptor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> criarUsuario(
            @RequestBody CriarUsuarioRequest requisicao,
            HttpServletRequest httpRequest
    ) {
        String perfilSolicitante = (String) httpRequest.getAttribute(AuthInterceptor.ATRIBUTO_ROLE);
        UsuarioResponse resposta = usuarioService.criarUsuario(requisicao, perfilSolicitante);
        return ResponseEntity.status(HttpStatus.CREATED).body(resposta);
    }

    @GetMapping
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios(HttpServletRequest httpRequest) {
        String perfilSolicitante = (String) httpRequest.getAttribute(AuthInterceptor.ATRIBUTO_ROLE);
        return ResponseEntity.ok(usuarioService.listarUsuarios(perfilSolicitante));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UsuarioResponse> buscarUsuarioPorId(@PathVariable Integer id) {
        return ResponseEntity.ok(usuarioService.buscarUsuarioPorId(id));
    }
}
