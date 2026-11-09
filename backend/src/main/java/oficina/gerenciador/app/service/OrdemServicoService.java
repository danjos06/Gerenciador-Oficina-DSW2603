package oficina.gerenciador.app.service;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.repository.OrdemServicoRepository;

@Service
public class OrdemServicoService {
    private final OrdemServicoRepository repository;

    public OrdemServicoService(OrdemServicoRepository repository) {
        this.repository = repository;
    }

    public List<OrdemServicoEntity> listarTodos() {
        return repository.findAll();
    }

    public OrdemServicoEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordem de serviço não encontrada para o ID: " + id));
    }

    public List<OrdemServicoEntity> listarPorCliente(int clienteId) {
        return repository.findByClienteId(clienteId);
    }

    public List<OrdemServicoEntity> listarPorVeiculo(int veiculoId) {
        return repository.findByVeiculoId(veiculoId);
    }

    public List<OrdemServicoEntity> listarPorStatus(String status) {
        return repository.findByStatusIgnoreCase(status);
    }

    public OrdemServicoEntity adicionar(OrdemServicoEntity ordem) {
        if (ordem == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordem.getCliente() == null || ordem.getCliente().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'cliente' é obrigatório.");
        }

        if (ordem.getVeiculo() == null || ordem.getVeiculo().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'veiculo' é obrigatório.");
        }

        if (ordem.getCriadoPor() == null || ordem.getCriadoPor().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'criadoPor' é obrigatório.");
        }

        if (ordem.getProblemaRelatado() == null || ordem.getProblemaRelatado().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'problemaRelatado' é obrigatório.");
        }

        if (ordem.getQuilometragem() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'quilometragem' é obrigatório.");
        }

        if (ordem.getStatus() == null || ordem.getStatus().trim().isEmpty()) {
            ordem.setStatus("aberta");
        }

        if (ordem.getDesconto() == null) {
            ordem.setDesconto(BigDecimal.ZERO);
        }

        return repository.save(ordem);
    }

    public OrdemServicoEntity atualizar(int id, OrdemServicoEntity ordem) {
        OrdemServicoEntity ordemExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordem de serviço não encontrada para o ID: " + id));

        if (ordem == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordem.getCliente() != null && ordem.getCliente().getId() != null) {
            ordemExistente.setCliente(ordem.getCliente());
        }

        if (ordem.getVeiculo() != null && ordem.getVeiculo().getId() != null) {
            ordemExistente.setVeiculo(ordem.getVeiculo());
        }

        if (ordem.getMecanico() != null) {
            ordemExistente.setMecanico(ordem.getMecanico());
        }

        if (ordem.getOrdemOrigem() != null) {
            ordemExistente.setOrdemOrigem(ordem.getOrdemOrigem());
        }

        if (ordem.getStatus() != null && !ordem.getStatus().trim().isEmpty()) {
            ordemExistente.setStatus(ordem.getStatus());
        }

        if (ordem.getProblemaRelatado() != null && !ordem.getProblemaRelatado().trim().isEmpty()) {
            ordemExistente.setProblemaRelatado(ordem.getProblemaRelatado());
        }

        if (ordem.getObservacoes() != null) {
            ordemExistente.setObservacoes(ordem.getObservacoes());
        }

        if (ordem.getQuilometragem() != null) {
            ordemExistente.setQuilometragem(ordem.getQuilometragem());
        }

        if (ordem.getDesconto() != null) {
            ordemExistente.setDesconto(ordem.getDesconto());
        }

        if (ordem.getDiasGarantia() != null) {
            ordemExistente.setDiasGarantia(ordem.getDiasGarantia());
        }

        if (ordem.getKmGarantia() != null) {
            ordemExistente.setKmGarantia(ordem.getKmGarantia());
        }

        if (ordem.getPrevisaoEntrega() != null) {
            ordemExistente.setPrevisaoEntrega(ordem.getPrevisaoEntrega());
        }

        if (ordem.getConcluidoEm() != null) {
            ordemExistente.setConcluidoEm(ordem.getConcluidoEm());
        }

        if (ordem.getEntregueEm() != null) {
            ordemExistente.setEntregueEm(ordem.getEntregueEm());
        }

        return repository.save(ordemExistente);
    }

    public void deletar(int id) {
        OrdemServicoEntity ordemExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordem de serviço não encontrada para o ID: " + id));
        repository.delete(ordemExistente);
    }
}
