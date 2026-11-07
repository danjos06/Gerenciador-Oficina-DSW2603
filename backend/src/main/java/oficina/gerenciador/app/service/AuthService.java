package oficina.gerenciador.app.service;

import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.model.request.LoginRequest;
import oficina.gerenciador.app.model.response.LoginResponse;
import oficina.gerenciador.app.model.response.UsuarioResponse;
import oficina.gerenciador.app.repository.UsuarioRepository;
import oficina.gerenciador.app.util.JwtUtil;
import oficina.gerenciador.app.util.Md5Util;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UsuarioRepository usuarioRepository, JwtUtil jwtUtil) {
        this.usuarioRepository = usuarioRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getSenha() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail e senha são obrigatórios");
        }

        String login = request.getEmail().trim();
        String senha = request.getSenha().trim();

        // Busca pelo email
        Optional<UsuarioEntity> usuarioOpt = usuarioRepository.buscarPorEmailIgnorandoCase(login);

        // Se não encontrar e o login informado for "admin" ou variação com admin, busca o usuário com perfil admin
        if (usuarioOpt.isEmpty() && (login.equalsIgnoreCase("admin") || login.toLowerCase().startsWith("admin@"))) {
            usuarioOpt = usuarioRepository.buscarPrimeiroPorPerfilIgnorandoCaseEAtivoTrue("admin");
        }

        if (usuarioOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        UsuarioEntity usuario = usuarioOpt.get();

        if (Boolean.FALSE.equals(usuario.getAtivo())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inativo");
        }

        String senhaHash = Md5Util.hash(senha);
        if (!senhaHash.equalsIgnoreCase(usuario.getSenhaHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String token = jwtUtil.gerarToken(usuario.getId(), usuario.getEmail(), usuario.getPerfil(), usuario.getNome());
        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .usuario(UsuarioResponse.deEntidade(usuario))
                .build();
    }
}
