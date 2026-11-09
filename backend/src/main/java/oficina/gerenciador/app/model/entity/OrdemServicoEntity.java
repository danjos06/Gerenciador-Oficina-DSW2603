package oficina.gerenciador.app.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_ordem_servico")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class OrdemServicoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "cliente_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_cliente"))
    private ClienteEntity cliente;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "veiculo_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_veiculo"))
    private VeiculoEntity veiculo;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "mecanico_id", foreignKey = @ForeignKey(name = "fk_ordem_mecanico"))
    private UsuarioEntity mecanico;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "criado_por_id", nullable = false, foreignKey = @ForeignKey(name = "fk_ordem_criador"))
    private UsuarioEntity criadoPor;

    // Auto-relacionamento para garantia/retorno
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ordem_origem_id", foreignKey = @ForeignKey(name = "fk_ordem_origem"))
    private OrdemServicoEntity ordemOrigem;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // aberta | em_andamento | aguardando_peca | concluida | entregue | cancelada

    @Column(name = "problema_relatado", nullable = false, columnDefinition = "TEXT")
    private String problemaRelatado;

    @Column(name = "observacoes", columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "quilometragem", nullable = false)
    private Integer quilometragem;

    @Column(name = "desconto", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal desconto = BigDecimal.ZERO;

    @Column(name = "dias_garantia")
    private Integer diasGarantia;

    @Column(name = "km_garantia")
    private Integer kmGarantia;

    @Column(name = "previsao_entrega")
    private LocalDate previsaoEntrega;

    @Column(name = "concluido_em")
    private LocalDateTime concluidoEm;

    @Column(name = "entregue_em")
    private LocalDateTime entregueEm;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;

    @UpdateTimestamp
    @Column(name = "modificado_em")
    private LocalDateTime modificadoEm;
}
