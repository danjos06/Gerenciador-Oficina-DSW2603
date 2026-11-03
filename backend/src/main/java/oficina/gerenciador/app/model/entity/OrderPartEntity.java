package oficina.gerenciador.app.model.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "tb_order_part")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderPartEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_part_order"))
    private ServiceOrderEntity order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "part_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_part_item"))
    private PartEntity part;

    @Column(name = "quantity", nullable = false)
    @Builder.Default
    private Integer quantity = 1;

    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;

    @Column(name = "origin", nullable = false, length = 20)
    @Builder.Default
    private String origin = "new"; // new | used | customer

    @Column(name = "pending", nullable = false)
    @Builder.Default
    private Boolean pending = false;

    @Column(name = "expected_arrival")
    private LocalDate expectedArrival;
}
