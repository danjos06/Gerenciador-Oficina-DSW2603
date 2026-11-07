package oficina.gerenciador.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_ordem_item_servico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrdemItemServicoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordem_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_servico_ordem"))
    private OrdemServicoEntity ordem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "servico_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_servico_item"))
    private ServicoEntity servico;

    @Column(name = "quantidade", nullable = false)
    @Builder.Default
    private Integer quantidade = 1;

    @Column(name = "preco_unitario", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoUnitario;

    @Column(name = "extra", nullable = false)
    @Builder.Default
    private Boolean extra = false;

    @Column(name = "metodo_aprovacao", length = 30)
    private String metodoAprovacao; // whatsapp | presencial | telefone

    @Column(name = "aprovado_em")
    private LocalDateTime aprovadoEm;
}
