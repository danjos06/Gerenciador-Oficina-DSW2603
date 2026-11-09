package oficina.gerenciador.app.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "tb_servico",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_servico_nome", columnNames = "nome")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class ServicoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nome", nullable = false, unique = true, length = 100)
    private String nome;

    @Column(name = "descricao", length = 255)
    private String descricao;

    @Column(name = "preco_referencia", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoReferencia;

    @Column(name = "minutos_estimados", nullable = false)
    private Integer minutosEstimados;

    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;
}
