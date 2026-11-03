package oficina.gerenciador.app.service;

import oficina.gerenciador.app.model.entity.UserEntity;
import oficina.gerenciador.app.model.request.LoginRequest;
import oficina.gerenciador.app.model.response.LoginResponse;
import oficina.gerenciador.app.model.response.UserResponse;
import oficina.gerenciador.app.repository.UserRepository;
import oficina.gerenciador.app.util.JwtUtil;
import oficina.gerenciador.app.util.Md5Util;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    public LoginResponse login(LoginRequest request) {
        if (request == null || request.getEmail() == null || request.getSenha() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail e senha são obrigatórios");
        }

        String login = request.getEmail().trim();
        String senha = request.getSenha().trim();

        // Busca pelo email
        Optional<UserEntity> userOpt = userRepository.findByEmailIgnoreCase(login);

        // Se não encontrar e o login informado for "admin" ou variação com admin, busca o usuário com perfil admin
        if (userOpt.isEmpty() && (login.equalsIgnoreCase("admin") || login.toLowerCase().startsWith("admin@"))) {
            userOpt = userRepository.findFirstByRoleIgnoreCaseAndActiveTrue("admin");
        }

        if (userOpt.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        UserEntity user = userOpt.get();

        if (Boolean.FALSE.equals(user.getActive())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuário inativo");
        }

        String senhaHash = Md5Util.hash(senha);
        if (!senhaHash.equalsIgnoreCase(user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciais inválidas");
        }

        String token = jwtUtil.gerarToken(user.getId(), user.getEmail(), user.getRole(), user.getName());
        return LoginResponse.builder()
                .token(token)
                .tipo("Bearer")
                .usuario(UserResponse.fromEntity(user))
                .build();
    }
}
