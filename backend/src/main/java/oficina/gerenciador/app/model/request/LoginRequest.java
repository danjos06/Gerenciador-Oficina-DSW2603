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
public class LoginRequest {

    @JsonAlias({"email", "username", "login", "usuario"})
    private String email;

    @JsonAlias({"senha", "password"})
    private String senha;
}
