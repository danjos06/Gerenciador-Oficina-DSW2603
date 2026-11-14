package oficina.gerenciador.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.PecaEntity;

public interface PecaRepository extends JpaRepository<PecaEntity, Integer> {
    Optional<PecaEntity> findByCodigo(String codigo);

    List<PecaEntity> findByNomeContainingIgnoreCase(String nome);

    List<PecaEntity> findByAtivoTrue();
}
