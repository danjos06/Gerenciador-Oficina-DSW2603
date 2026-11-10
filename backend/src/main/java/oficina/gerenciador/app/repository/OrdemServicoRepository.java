package oficina.gerenciador.app.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.model.enums.StatusOrdem;

public interface OrdemServicoRepository extends JpaRepository<OrdemServicoEntity, Integer> {
    List<OrdemServicoEntity> findByClienteId(Integer clienteId);

    List<OrdemServicoEntity> findByVeiculoId(Integer veiculoId);

    List<OrdemServicoEntity> findByStatus(StatusOrdem status);
}
