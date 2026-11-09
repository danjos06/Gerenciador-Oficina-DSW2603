package oficina.gerenciador.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;

public interface HistoricoStatusOrdemRepository extends JpaRepository<HistoricoStatusOrdemEntity, Integer> {
    List<HistoricoStatusOrdemEntity> findByOrdemId(Integer ordemId);

    List<HistoricoStatusOrdemEntity> findByOrdemIdOrderByCriadoEmAsc(Integer ordemId);
}
