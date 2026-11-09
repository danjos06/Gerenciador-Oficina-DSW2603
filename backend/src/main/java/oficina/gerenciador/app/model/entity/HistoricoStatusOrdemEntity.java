package oficina.gerenciador.app.model.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "tb_historico_status_ordem")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class HistoricoStatusOrdemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ordem_id", nullable = false, foreignKey = @ForeignKey(name = "fk_historico_ordem"))
    private OrdemServicoEntity ordem;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "usuario_id", nullable = false, foreignKey = @ForeignKey(name = "fk_historico_usuario"))
    private UsuarioEntity usuario;

    @Column(name = "status_anterior", length = 30)
    private String statusAnterior;

    @Column(name = "novo_status", nullable = false, length = 30)
    private String novoStatus;

    @Column(name = "justificativa", columnDefinition = "TEXT")
    private String justificativa;

    @CreationTimestamp
    @Column(name = "criado_em", nullable = false, updatable = false)
    private LocalDateTime criadoEm;
}
