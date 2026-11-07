package oficina.gerenciador.app.model.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import oficina.gerenciador.app.model.entity.UsuarioEntity;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Integer id;
    private String nome;
    private String email;
    private String perfil;
    private Boolean ativo;
    private LocalDateTime criadoEm;

    public static UsuarioResponse deEntidade(UsuarioEntity entidade) {
        if (entidade == null) {
            return null;
        }
        return UsuarioResponse.builder()
                .id(entidade.getId())
                .nome(entidade.getNome())
                .email(entidade.getEmail())
                .perfil(entidade.getPerfil())
                .ativo(entidade.getAtivo())
                .criadoEm(entidade.getCriadoEm())
                .build();
    }
}
