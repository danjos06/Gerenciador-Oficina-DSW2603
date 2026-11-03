package oficina.gerenciador.app.repository;

import oficina.gerenciador.app.model.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Integer> {

    Optional<UserEntity> findByEmailIgnoreCase(String email);

    boolean existsByEmailIgnoreCase(String email);

    Optional<UserEntity> findFirstByRoleIgnoreCaseAndActiveTrue(String role);

    boolean existsByRoleIgnoreCase(String role);
}
