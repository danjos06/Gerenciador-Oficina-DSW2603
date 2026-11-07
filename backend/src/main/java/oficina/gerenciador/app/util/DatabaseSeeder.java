package oficina.gerenciador.app.util;

import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatabaseSeeder.class);

    private final UsuarioRepository usuarioRepository;

    public DatabaseSeeder(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public void run(String... args) {
        if (usuarioRepository.count() == 0 || !usuarioRepository.existePorPerfilIgnorandoCase("admin")) {
            if (!usuarioRepository.existePorEmailIgnorandoCase("admin@oficina.com")) {
                UsuarioEntity admin = UsuarioEntity.builder()
                        .nome("Administrador")
                        .email("admin@oficina.com")
                        .senhaHash(Md5Util.hash("1234"))
                        .perfil("admin")
                        .ativo(true)
                        .criadoEm(LocalDateTime.now())
                        .build();

                usuarioRepository.save(admin);
                log.info(">>> [SEED] Conta de administrador inicial criada com sucesso: admin@oficina.com / senha: 1234");
            }
        } else {
            log.info(">>> [SEED] Usuário administrador já existe no banco de dados.");
        }
    }
}
