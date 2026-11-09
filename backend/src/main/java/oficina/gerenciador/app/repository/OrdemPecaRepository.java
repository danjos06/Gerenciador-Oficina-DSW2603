package oficina.gerenciador.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.OrdemPecaEntity;

public interface OrdemPecaRepository extends JpaRepository<OrdemPecaEntity, Integer> {
    List<OrdemPecaEntity> findByOrdemId(Integer ordemId);
}
