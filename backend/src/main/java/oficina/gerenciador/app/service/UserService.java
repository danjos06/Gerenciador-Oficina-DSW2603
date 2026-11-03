package oficina.gerenciador.app.service;

import oficina.gerenciador.app.model.entity.UserEntity;
import oficina.gerenciador.app.model.request.CreateUserRequest;
import oficina.gerenciador.app.model.response.UserResponse;
import oficina.gerenciador.app.repository.UserRepository;
import oficina.gerenciador.app.util.Md5Util;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse createUser(CreateUserRequest request, String callerRole) {
        if (callerRole == null || !callerRole.equalsIgnoreCase("admin")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem criar usuários");
        }

        if (request == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do usuário não informados");
        }

        if (request.getName() == null || request.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail é obrigatório");
        }

        if (request.getSenha() == null || request.getSenha().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha é obrigatória");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        String role = request.getRole();
        if (role == null || role.trim().isEmpty()) {
            role = "operational";
        } else {
            role = role.trim().toLowerCase();
            if (!role.equals("admin") && !role.equals("operational")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Role inválida. Use 'admin' ou 'operational'");
            }
        }

        UserEntity user = UserEntity.builder()
                .name(request.getName().trim())
                .email(email)
                .passwordHash(Md5Util.hash(request.getSenha().trim()))
                .role(role)
                .active(request.getActive() == null ? true : request.getActive())
                .build();

        UserEntity saved = userRepository.save(user);
        return UserResponse.fromEntity(saved);
    }

    public List<UserResponse> listUsers(String callerRole) {
        return userRepository.findAll().stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UserResponse getUserById(Integer id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        return UserResponse.fromEntity(user);
    }
}
