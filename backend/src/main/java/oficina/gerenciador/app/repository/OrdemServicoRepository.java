package oficina.gerenciador.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.OrdemServicoEntity;

public interface OrdemServicoRepository extends JpaRepository<OrdemServicoEntity, Integer> {
    List<OrdemServicoEntity> findByClienteId(Integer clienteId);

    List<OrdemServicoEntity> findByVeiculoId(Integer veiculoId);

    List<OrdemServicoEntity> findByStatusIgnoreCase(String status);
}
