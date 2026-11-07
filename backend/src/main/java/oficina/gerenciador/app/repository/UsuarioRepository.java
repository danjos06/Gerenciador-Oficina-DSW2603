package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.UsuarioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<UsuarioEntity, Integer> {

    @Query("SELECT u FROM UsuarioEntity u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<UsuarioEntity> buscarPorEmailIgnorandoCase(@Param("email") String email);

    @Query("SELECT COUNT(u) > 0 FROM UsuarioEntity u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existePorEmailIgnorandoCase(@Param("email") String email);

    Optional<UsuarioEntity> findFirstByPerfilIgnoreCaseAndAtivoTrue(String perfil);

    default Optional<UsuarioEntity> buscarPrimeiroPorPerfilIgnorandoCaseEAtivoTrue(String perfil) {
        return findFirstByPerfilIgnoreCaseAndAtivoTrue(perfil);
    }

    @Query("SELECT COUNT(u) > 0 FROM UsuarioEntity u WHERE LOWER(u.perfil) = LOWER(:perfil)")
    boolean existePorPerfilIgnorandoCase(@Param("perfil") String perfil);
}
