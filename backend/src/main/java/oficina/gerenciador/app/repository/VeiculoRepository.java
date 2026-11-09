package oficina.gerenciador.app.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import oficina.gerenciador.app.model.entity.VeiculoEntity;

public interface VeiculoRepository extends JpaRepository<VeiculoEntity, Integer> {
    Optional<VeiculoEntity> findByPlaca(String placa);

    List<VeiculoEntity> findByClienteId(Integer clienteId);
}
