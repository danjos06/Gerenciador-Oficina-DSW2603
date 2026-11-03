package oficina.gerenciador.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "tb_part")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "name", nullable = false, length = 120)
    private String name;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "reference_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal referencePrice;

    @Column(name = "active", nullable = false)
    @Builder.Default
    private Boolean active = true;
}