package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Integer> {
    Optional<UsuarioEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<UsuarioEntity> findFirstByPerfilIgnoreCaseAndAtivoTrue(String perfil);

    default Optional<UsuarioEntity> buscarPrimeiroPorPerfilIgnorandoCaseEAtivoTrue(String perfil) {
        return findFirstByPerfilIgnoreCaseAndAtivoTrue(perfil);
    }

    boolean existsByPerfilIgnoreCase(String perfil);

    List<UsuarioEntity> findByAtivoTrue();
}
