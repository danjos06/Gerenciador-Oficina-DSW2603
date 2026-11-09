package oficina.gerenciador.app.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_ordem_peca")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OrdemPecaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ordem_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_peca_ordem"))
    private OrdemServicoEntity ordem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "peca_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_peca_item"))
    private PecaEntity peca;

    @Column(name = "quantidade", nullable = false)
    @Builder.Default
    private Integer quantidade = 1;

    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(name = "origem", nullable = false, length = 20)
    @Builder.Default
    private String origem = "nova"; // nova | usada | cliente

    @Column(name = "pendente", nullable = false)
    @Builder.Default
    private Boolean pendente = false;

    @Column(name = "previsao_chegada")
    private LocalDate previsaoChegada;
}
