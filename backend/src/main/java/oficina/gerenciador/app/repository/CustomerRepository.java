package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.CustomerEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;


@Repository 
public interface CustomerRepository extends JpaRepository<CustomerEntity, Integer>{
    Optional<CustomerEntity> findByPhone(String phone);
    Optional<CustomerEntity> findByCpfCnpj(String cpfCnpj);
}
