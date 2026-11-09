package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.repository.HistoricoStatusOrdemRepository;

@Service
public class HistoricoStatusOrdemService {
    private final HistoricoStatusOrdemRepository repository;

    public HistoricoStatusOrdemService(HistoricoStatusOrdemRepository repository) {
        this.repository = repository;
    }

    public List<HistoricoStatusOrdemEntity> listarTodos() {
        return repository.findAll();
    }

    public HistoricoStatusOrdemEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Histórico de status não encontrado para o ID: " + id));
    }

    public List<HistoricoStatusOrdemEntity> listarPorOrdem(int ordemId) {
        return repository.findByOrdemId(ordemId);
    }

    public HistoricoStatusOrdemEntity adicionar(HistoricoStatusOrdemEntity historico) {
        if (historico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (historico.getOrdem() == null || historico.getOrdem().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'ordem' é obrigatório.");
        }

        if (historico.getUsuario() == null || historico.getUsuario().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'usuario' é obrigatório.");
        }

        if (historico.getNovoStatus() == null || historico.getNovoStatus().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'novoStatus' é obrigatório.");
        }

        return repository.save(historico);
    }

    public HistoricoStatusOrdemEntity atualizar(int id, HistoricoStatusOrdemEntity historico) {
        HistoricoStatusOrdemEntity historicoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Histórico de status não encontrado para o ID: " + id));

        if (historico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (historico.getOrdem() != null && historico.getOrdem().getId() != null) {
            historicoExistente.setOrdem(historico.getOrdem());
        }

        if (historico.getUsuario() != null && historico.getUsuario().getId() != null) {
            historicoExistente.setUsuario(historico.getUsuario());
        }

        if (historico.getStatusAnterior() != null) {
            historicoExistente.setStatusAnterior(historico.getStatusAnterior());
        }

        if (historico.getNovoStatus() != null && !historico.getNovoStatus().trim().isEmpty()) {
            historicoExistente.setNovoStatus(historico.getNovoStatus());
        }

        if (historico.getJustificativa() != null) {
            historicoExistente.setJustificativa(historico.getJustificativa());
        }

        return repository.save(historicoExistente);
    }

    public void deletar(int id) {
        HistoricoStatusOrdemEntity historicoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Histórico de status não encontrado para o ID: " + id));
        repository.delete(historicoExistente);
    }
}
