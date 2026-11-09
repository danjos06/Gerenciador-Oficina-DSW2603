package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.ServicoEntity;
import oficina.gerenciador.app.repository.ServicoRepository;

@Service
public class ServicoService {
    private final ServicoRepository repository;

    public ServicoService(ServicoRepository repository) {
        this.repository = repository;
    }

    public List<ServicoEntity> listarTodos() {
        return repository.findAll();
    }

    public ServicoEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado para o ID: " + id));
    }

    public List<ServicoEntity> listarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public ServicoEntity adicionar(ServicoEntity servico) {
        if (servico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (servico.getNome() == null || servico.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'nome' é obrigatório.");
        }

        if (servico.getPrecoReferencia() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'precoReferencia' é obrigatório.");
        }

        if (servico.getMinutosEstimados() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'minutosEstimados' é obrigatório.");
        }

        if (repository.findByNomeIgnoreCase(servico.getNome().trim()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Serviço com este nome já cadastrado.");
        }

        if (servico.getAtivo() == null) {
            servico.setAtivo(true);
        }

        return repository.save(servico);
    }

    public ServicoEntity atualizar(int id, ServicoEntity servico) {
        ServicoEntity servicoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado para o ID: " + id));

        if (servico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (servico.getNome() != null && !servico.getNome().trim().isEmpty()) {
            servicoExistente.setNome(servico.getNome());
        }

        if (servico.getDescricao() != null) {
            servicoExistente.setDescricao(servico.getDescricao());
        }

        if (servico.getPrecoReferencia() != null) {
            servicoExistente.setPrecoReferencia(servico.getPrecoReferencia());
        }

        if (servico.getMinutosEstimados() != null) {
            servicoExistente.setMinutosEstimados(servico.getMinutosEstimados());
        }

        if (servico.getAtivo() != null) {
            servicoExistente.setAtivo(servico.getAtivo());
        }

        return repository.save(servicoExistente);
    }

    public void deletar(int id) {
        ServicoEntity servicoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado para o ID: " + id));
        repository.delete(servicoExistente);
    }
}
