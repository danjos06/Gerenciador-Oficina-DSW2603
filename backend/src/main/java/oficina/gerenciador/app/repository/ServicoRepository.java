package oficina.gerenciador.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.ServicoEntity;

public interface ServicoRepository extends JpaRepository<ServicoEntity, Integer> {
    Optional<ServicoEntity> findByNomeIgnoreCase(String nome);

    List<ServicoEntity> findByNomeContainingIgnoreCase(String nome);
}
