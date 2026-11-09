package oficina.gerenciador.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;

public interface OrdemItemServicoRepository extends JpaRepository<OrdemItemServicoEntity, Integer> {
    List<OrdemItemServicoEntity> findByOrdemId(Integer ordemId);
}
