package oficina.gerenciador.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_peca")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PecaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "nome", nullable = false, length = 120)
    private String nome;

    @Column(name = "codigo", length = 50)
    private String codigo;

    @Column(name = "preco_referencia", nullable = false, precision = 10, scale = 2)
    private BigDecimal precoReferencia;

    @Column(name = "ativo", nullable = false)
    @Builder.Default
    private Boolean ativo = true;
}
