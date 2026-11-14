package oficina.gerenciador.app.model.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.model.entity.OrdemServicoEntity;

@Data 
@Builder 
@NoArgsConstructor 
@AllArgsConstructor 
public class OrdemServicoResumoResponse {
   private OrdemServicoEntity ordem;
   private List<OrdemPecaEntity> pecas;
   private List<OrdemItemServicoEntity> servicos;
   private List<HistoricoStatusOrdemEntity> historico;

   private BigDecimal totalPecas;
   private BigDecimal totalServicos;
   private BigDecimal totalBruto;
   private BigDecimal desconto;
   private BigDecimal valorTotal;
}
