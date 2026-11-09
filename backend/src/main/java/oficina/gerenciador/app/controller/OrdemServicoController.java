package oficina.gerenciador.app.controller;

import java.util.List;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.service.OrdemServicoService;
import oficina.gerenciador.app.util.AuthInterceptor;

@RestController
@RequestMapping("/ordens-servico")
@RequiredArgsConstructor
public class OrdemServicoController {
    private final OrdemServicoService service;

    // =========================================================================
    // ORDEM DE SERVIÇO
    // =========================================================================

    @GetMapping
    public List<OrdemServicoEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public OrdemServicoEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/cliente/{clienteId}")
    public List<OrdemServicoEntity> listarPorCliente(@PathVariable int clienteId) {
        return service.listarPorCliente(clienteId);
    }

    @GetMapping("/veiculo/{veiculoId}")
    public List<OrdemServicoEntity> listarPorVeiculo(@PathVariable int veiculoId) {
        return service.listarPorVeiculo(veiculoId);
    }

    @GetMapping("/status/{status}")
    public List<OrdemServicoEntity> listarPorStatus(@PathVariable String status) {
        return service.listarPorStatus(status);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrdemServicoEntity adicionar(
            @RequestBody OrdemServicoEntity ordem,
            HttpServletRequest request
    ) {
        Integer usuarioLogadoId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        return service.adicionar(ordem, usuarioLogadoId);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemServicoEntity atualizar(
            @PathVariable int id,
            @RequestBody OrdemServicoEntity ordem,
            HttpServletRequest request
    ) {
        Integer usuarioLogadoId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        return service.atualizar(id, ordem, usuarioLogadoId);
    }

    @PatchMapping("/{id}/status")
    @ResponseStatus(HttpStatus.OK)
    public OrdemServicoEntity atualizarStatus(
            @PathVariable int id,
            @RequestBody Map<String, String> body,
            HttpServletRequest request
    ) {
        Integer usuarioLogadoId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        String novoStatus = body != null ? body.getOrDefault("novoStatus", body.get("status")) : null;
        String justificativa = body != null ? body.get("justificativa") : null;
        return service.atualizarStatus(id, novoStatus, justificativa, usuarioLogadoId);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable int id, HttpServletRequest request) {
        Integer usuarioLogadoId = (Integer) request.getAttribute(AuthInterceptor.ATRIBUTO_USUARIO_ID);
        service.cancelar(id, usuarioLogadoId);
    }

    // =========================================================================
    // PEÇAS DA ORDEM DE SERVIÇO
    // =========================================================================

    @GetMapping("/{ordemId}/pecas")
    public List<OrdemPecaEntity> listarPecas(@PathVariable int ordemId) {
        return service.listarPecasPorOrdem(ordemId);
    }

    @PostMapping("/{ordemId}/pecas")
    @ResponseStatus(HttpStatus.CREATED)
    public OrdemPecaEntity adicionarPeca(
            @PathVariable int ordemId,
            @RequestBody OrdemPecaEntity itemPeca
    ) {
        return service.adicionarPeca(ordemId, itemPeca);
    }

    @PutMapping("/{ordemId}/pecas/{itemPecaId}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemPecaEntity atualizarPeca(
            @PathVariable int ordemId,
            @PathVariable int itemPecaId,
            @RequestBody OrdemPecaEntity itemPeca
    ) {
        return service.atualizarPeca(ordemId, itemPecaId, itemPeca);
    }

    @DeleteMapping("/{ordemId}/pecas/{itemPecaId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerPeca(
            @PathVariable int ordemId,
            @PathVariable int itemPecaId
    ) {
        service.removerPeca(ordemId, itemPecaId);
    }

    // =========================================================================
    // SERVIÇOS DA ORDEM DE SERVIÇO
    // =========================================================================

    @GetMapping("/{ordemId}/servicos")
    public List<OrdemItemServicoEntity> listarServicos(@PathVariable int ordemId) {
        return service.listarServicosPorOrdem(ordemId);
    }

    @PostMapping("/{ordemId}/servicos")
    @ResponseStatus(HttpStatus.CREATED)
    public OrdemItemServicoEntity adicionarServico(
            @PathVariable int ordemId,
            @RequestBody OrdemItemServicoEntity itemServico
    ) {
        return service.adicionarServico(ordemId, itemServico);
    }

    @PutMapping("/{ordemId}/servicos/{itemServicoId}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemItemServicoEntity atualizarServico(
            @PathVariable int ordemId,
            @PathVariable int itemServicoId,
            @RequestBody OrdemItemServicoEntity itemServico
    ) {
        return service.atualizarServico(ordemId, itemServicoId, itemServico);
    }

    @DeleteMapping("/{ordemId}/servicos/{itemServicoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removerServico(
            @PathVariable int ordemId,
            @PathVariable int itemServicoId
    ) {
        service.removerServico(ordemId, itemServicoId);
    }

    // =========================================================================
    // HISTÓRICO DE STATUS DA ORDEM DE SERVIÇO (SOMENTE LEITURA)
    // =========================================================================

    @GetMapping("/{ordemId}/historico")
    public List<HistoricoStatusOrdemEntity> listarHistorico(@PathVariable int ordemId) {
        return service.listarHistoricoPorOrdem(ordemId);
    }
}
