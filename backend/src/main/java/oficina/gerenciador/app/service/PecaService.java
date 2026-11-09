package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.PecaEntity;
import oficina.gerenciador.app.repository.PecaRepository;

@Service
public class PecaService {
    private final PecaRepository repository;

    public PecaService(PecaRepository repository) {
        this.repository = repository;
    }

    public List<PecaEntity> listarTodos() {
        return repository.findAll();
    }

    public PecaEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça não encontrada para o ID: " + id));
    }

    public PecaEntity buscarPorCodigo(String codigo) {
        return repository.findByCodigo(codigo)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça não encontrada para o código: " + codigo));
    }

    public List<PecaEntity> listarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    public PecaEntity adicionar(PecaEntity peca) {
        if (peca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (peca.getNome() == null || peca.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'nome' é obrigatório.");
        }

        if (peca.getPrecoReferencia() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'precoReferencia' é obrigatório.");
        }

        if (peca.getCodigo() != null && !peca.getCodigo().trim().isEmpty()) {
            if (repository.findByCodigo(peca.getCodigo()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Código de peça já cadastrado.");
            }
        }

        if (peca.getAtivo() == null) {
            peca.setAtivo(true);
        }

        return repository.save(peca);
    }

    public PecaEntity atualizar(int id, PecaEntity peca) {
        PecaEntity pecaExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça não encontrada para o ID: " + id));

        if (peca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (peca.getNome() != null && !peca.getNome().trim().isEmpty()) {
            pecaExistente.setNome(peca.getNome());
        }

        if (peca.getCodigo() != null && !peca.getCodigo().trim().isEmpty()) {
            pecaExistente.setCodigo(peca.getCodigo());
        }

        if (peca.getPrecoReferencia() != null) {
            pecaExistente.setPrecoReferencia(peca.getPrecoReferencia());
        }

        if (peca.getAtivo() != null) {
            pecaExistente.setAtivo(peca.getAtivo());
        }

        return repository.save(pecaExistente);
    }

    public void deletar(int id) {
        PecaEntity pecaExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça não encontrada para o ID: " + id));
        repository.delete(pecaExistente);
    }
}
