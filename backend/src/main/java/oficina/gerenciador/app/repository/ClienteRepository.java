package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;

public interface ClienteRepository extends JpaRepository<ClienteEntity, Integer> {
    Optional<ClienteEntity> findByTelefone(String telefone);

    Optional<ClienteEntity> findByCpfCnpj(String cpfCnpj);

    List<ClienteEntity> findByNomeContainingIgnoreCase(String nome);

    List<ClienteEntity> findByAtivoTrue();
}
