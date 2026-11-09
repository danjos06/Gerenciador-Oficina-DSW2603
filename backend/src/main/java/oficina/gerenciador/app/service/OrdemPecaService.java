package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.repository.OrdemPecaRepository;

@Service
public class OrdemPecaService {
    private final OrdemPecaRepository repository;

    public OrdemPecaService(OrdemPecaRepository repository) {
        this.repository = repository;
    }

    public List<OrdemPecaEntity> listarTodos() {
        return repository.findAll();
    }

    public OrdemPecaEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça da ordem não encontrada para o ID: " + id));
    }

    public List<OrdemPecaEntity> listarPorOrdem(int ordemId) {
        return repository.findByOrdemId(ordemId);
    }

    public OrdemPecaEntity adicionar(OrdemPecaEntity ordemPeca) {
        if (ordemPeca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordemPeca.getOrdem() == null || ordemPeca.getOrdem().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'ordem' é obrigatório.");
        }

        if (ordemPeca.getPeca() == null || ordemPeca.getPeca().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'peca' é obrigatório.");
        }

        if (ordemPeca.getPrecoUnitario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'precoUnitario' é obrigatório.");
        }

        if (ordemPeca.getQuantidade() == null) {
            ordemPeca.setQuantidade(1);
        }

        if (ordemPeca.getOrigem() == null || ordemPeca.getOrigem().trim().isEmpty()) {
            ordemPeca.setOrigem("nova");
        }

        if (ordemPeca.getPendente() == null) {
            ordemPeca.setPendente(false);
        }

        return repository.save(ordemPeca);
    }

    public OrdemPecaEntity atualizar(int id, OrdemPecaEntity ordemPeca) {
        OrdemPecaEntity ordemPecaExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça da ordem não encontrada para o ID: " + id));

        if (ordemPeca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordemPeca.getOrdem() != null && ordemPeca.getOrdem().getId() != null) {
            ordemPecaExistente.setOrdem(ordemPeca.getOrdem());
        }

        if (ordemPeca.getPeca() != null && ordemPeca.getPeca().getId() != null) {
            ordemPecaExistente.setPeca(ordemPeca.getPeca());
        }

        if (ordemPeca.getQuantidade() != null) {
            ordemPecaExistente.setQuantidade(ordemPeca.getQuantidade());
        }

        if (ordemPeca.getPrecoUnitario() != null) {
            ordemPecaExistente.setPrecoUnitario(ordemPeca.getPrecoUnitario());
        }

        if (ordemPeca.getOrigem() != null && !ordemPeca.getOrigem().trim().isEmpty()) {
            ordemPecaExistente.setOrigem(ordemPeca.getOrigem());
        }

        if (ordemPeca.getPendente() != null) {
            ordemPecaExistente.setPendente(ordemPeca.getPendente());
        }

        if (ordemPeca.getPrevisaoChegada() != null) {
            ordemPecaExistente.setPrevisaoChegada(ordemPeca.getPrevisaoChegada());
        }

        return repository.save(ordemPecaExistente);
    }

    public void deletar(int id) {
        OrdemPecaEntity ordemPecaExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça da ordem não encontrada para o ID: " + id));
        repository.delete(ordemPecaExistente);
    }
}
