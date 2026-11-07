package oficina.gerenciador.app.model.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CriarUsuarioRequest {

    @JsonAlias({"nome", "name"})
    private String nome;

    @JsonAlias({"email", "login"})
    private String email;

    @JsonAlias({"senha", "password"})
    private String senha;

    @JsonAlias({"perfil", "role"})
    private String perfil; // "admin" | "operational"

    @JsonAlias({"ativo", "active"})
    private Boolean ativo;
}
