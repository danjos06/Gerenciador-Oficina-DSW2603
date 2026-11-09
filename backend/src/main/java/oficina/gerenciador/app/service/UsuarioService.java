package oficina.gerenciador.app.service;

import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.model.request.CriarUsuarioRequest;
import oficina.gerenciador.app.model.response.UsuarioResponse;
import oficina.gerenciador.app.repository.UsuarioRepository;
import oficina.gerenciador.app.util.Md5Util;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public UsuarioResponse criarUsuario(CriarUsuarioRequest requisicao, String perfilSolicitante) {
        if (perfilSolicitante == null || !perfilSolicitante.equalsIgnoreCase("admin")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: apenas administradores podem criar usuários");
        }

        if (requisicao == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados do usuário não informados");
        }

        if (requisicao.getNome() == null || requisicao.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nome é obrigatório");
        }

        if (requisicao.getEmail() == null || requisicao.getEmail().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "E-mail é obrigatório");
        }

        if (requisicao.getSenha() == null || requisicao.getSenha().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Senha é obrigatória");
        }

        String email = requisicao.getEmail().trim().toLowerCase();
        if (usuarioRepository.existsByEmailIgnoreCase(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        }

        String perfil = requisicao.getPerfil();
        if (perfil == null || perfil.trim().isEmpty()) {
            perfil = "operational";
        } else {
            perfil = perfil.trim().toLowerCase();
            if (!perfil.equals("admin") && !perfil.equals("operational")) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Perfil inválido. Use 'admin' ou 'operational'");
            }
        }

        UsuarioEntity usuario = UsuarioEntity.builder()
                .nome(requisicao.getNome().trim())
                .email(email)
                .senhaHash(Md5Util.hash(requisicao.getSenha().trim()))
                .perfil(perfil)
                .ativo(requisicao.getAtivo() == null ? true : requisicao.getAtivo())
                .build();

        UsuarioEntity salvo = usuarioRepository.save(usuario);
        return UsuarioResponse.deEntidade(salvo);
    }

    public List<UsuarioResponse> listarUsuarios(String perfilSolicitante) {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::deEntidade)
                .collect(Collectors.toList());
    }

    public UsuarioResponse buscarUsuarioPorId(Integer id) {
        UsuarioEntity usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuário não encontrado"));
        return UsuarioResponse.deEntidade(usuario);
    }
}
