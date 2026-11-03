package oficina.gerenciador.app.util;

import oficina.gerenciador.app.model.entity.UserEntity;
import oficina.gerenciador.app.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UserRepository userRepository;

    public DatabaseSeeder(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() == 0 || !userRepository.existsByRoleIgnoreCase("admin")) {
            if (!userRepository.existsByEmailIgnoreCase("admin@oficina.com")) {
                UserEntity admin = UserEntity.builder()
                        .name("Administrador")
                        .email("admin@oficina.com")
                        .passwordHash(Md5Util.hash("1234"))
                        .role("admin")
                        .active(true)
                        .createdAt(LocalDateTime.now())
                        .build();

                userRepository.save(admin);
                log.info(">>> [SEED] Conta de administrador inicial criada com sucesso: admin@oficina.com / senha: 1234");
            }
        } else {
            log.info(">>> [SEED] Usuário administrador já existe no banco de dados.");
        }
    }
}
