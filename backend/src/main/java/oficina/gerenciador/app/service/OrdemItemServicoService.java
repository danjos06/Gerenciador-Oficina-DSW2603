package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.repository.OrdemItemServicoRepository;

@Service
public class OrdemItemServicoService {
    private final OrdemItemServicoRepository repository;

    public OrdemItemServicoService(OrdemItemServicoRepository repository) {
        this.repository = repository;
    }

    public List<OrdemItemServicoEntity> listarTodos() {
        return repository.findAll();
    }

    public OrdemItemServicoEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de serviço da ordem não encontrado para o ID: " + id));
    }

    public List<OrdemItemServicoEntity> listarPorOrdem(int ordemId) {
        return repository.findByOrdemId(ordemId);
    }

    public OrdemItemServicoEntity adicionar(OrdemItemServicoEntity item) {
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (item.getOrdem() == null || item.getOrdem().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'ordem' é obrigatório.");
        }

        if (item.getServico() == null || item.getServico().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'servico' é obrigatório.");
        }

        if (item.getPrecoUnitario() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'precoUnitario' é obrigatório.");
        }

        if (item.getQuantidade() == null) {
            item.setQuantidade(1);
        }

        if (item.getExtra() == null) {
            item.setExtra(false);
        }

        return repository.save(item);
    }

    public OrdemItemServicoEntity atualizar(int id, OrdemItemServicoEntity item) {
        OrdemItemServicoEntity itemExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de serviço da ordem não encontrado para o ID: " + id));

        if (item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (item.getOrdem() != null && item.getOrdem().getId() != null) {
            itemExistente.setOrdem(item.getOrdem());
        }

        if (item.getServico() != null && item.getServico().getId() != null) {
            itemExistente.setServico(item.getServico());
        }

        if (item.getQuantidade() != null) {
            itemExistente.setQuantidade(item.getQuantidade());
        }

        if (item.getPrecoUnitario() != null) {
            itemExistente.setPrecoUnitario(item.getPrecoUnitario());
        }

        if (item.getExtra() != null) {
            itemExistente.setExtra(item.getExtra());
        }

        if (item.getMetodoAprovacao() != null) {
            itemExistente.setMetodoAprovacao(item.getMetodoAprovacao());
        }

        if (item.getAprovadoEm() != null) {
            itemExistente.setAprovadoEm(item.getAprovadoEm());
        }

        return repository.save(itemExistente);
    }

    public void deletar(int id) {
        OrdemItemServicoEntity itemExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de serviço da ordem não encontrado para o ID: " + id));
        repository.delete(itemExistente);
    }
}
