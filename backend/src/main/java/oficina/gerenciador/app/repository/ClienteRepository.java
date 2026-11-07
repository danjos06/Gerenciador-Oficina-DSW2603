package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.ClienteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClienteRepository extends JpaRepository<ClienteEntity, Integer> {

    @Query("SELECT c FROM ClienteEntity c WHERE c.telefone = :telefone")
    Optional<ClienteEntity> buscarPorTelefone(@Param("telefone") String telefone);

    @Query("SELECT c FROM ClienteEntity c WHERE c.cpfCnpj = :cpfCnpj")
    Optional<ClienteEntity> buscarPorCpfCnpj(@Param("cpfCnpj") String cpfCnpj);
}
