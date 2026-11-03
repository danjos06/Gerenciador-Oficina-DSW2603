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
public class CreateUserRequest {

    @JsonAlias({"name", "nome"})
    private String name;

    @JsonAlias({"email", "login"})
    private String email;

    @JsonAlias({"senha", "password"})
    private String senha;

    @JsonAlias({"role", "perfil"})
    private String role; // "admin" | "operational"

    private Boolean active;
}
