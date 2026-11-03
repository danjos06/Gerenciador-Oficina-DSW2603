package oficina.gerenciador.app.model.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_service_order")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ServiceOrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_customer"))
    private CustomerEntity customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_vehicle"))
    private VehicleEntity vehicle;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mechanic_id", foreignKey = @ForeignKey(name = "fk_order_mechanic"))
    private UserEntity mechanic;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_creator"))
    private UserEntity createdBy;

    // Auto-relacionamento para garantia/retorno
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_order_id", foreignKey = @ForeignKey(name = "fk_order_origin"))
    private ServiceOrderEntity originOrder;

    @Column(name = "status", nullable = false, length = 30)
    private String status; // open | in_progress | waiting_part | completed | delivered | canceled

    @Column(name = "reported_problem", nullable = false, columnDefinition = "TEXT")
    private String reportedProblem;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "mileage", nullable = false)
    private Integer mileage;

    @Column(name = "discount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @Column(name = "warranty_days")
    private Integer warrantyDays;

    @Column(name = "warranty_km")
    private Integer warrantyKm;

    @Column(name = "expected_delivery")
    private LocalDate expectedDelivery;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "modified_at")
    private LocalDateTime modifiedAt;
}
