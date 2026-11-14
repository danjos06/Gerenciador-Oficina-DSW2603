package oficina.gerenciador.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.repository.ClienteRepository;
import oficina.gerenciador.app.model.entity.ClienteEntity;

import java.util.List;

@Service
public class ClienteService {
    private final ClienteRepository repository;

    public ClienteService(ClienteRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<ClienteEntity> listarTodos() {
        return repository.findByAtivoTrue();
    }

    @Transactional(readOnly = true)
    public ClienteEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado para o ID: " + id));
    }

    @Transactional(readOnly = true)
    public ClienteEntity buscarPorCpfCnpj(String cpfCnpj) {
        return repository.findByCpfCnpj(cpfCnpj)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado para o CPF/CNPJ: " + cpfCnpj));
    }

    @Transactional(readOnly = true)
    public ClienteEntity buscarPorTelefone(String telefone) {
        return repository.findByTelefone(telefone)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado para o Telefone: " + telefone));
    }

    @Transactional(readOnly = true)
    public List<ClienteEntity> listarPorNome(String nome) {
        return repository.findByNomeContainingIgnoreCase(nome);
    }

    @Transactional
    public ClienteEntity adicionar(ClienteEntity cliente) {
        if (cliente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (cliente.getNome() == null || cliente.getNome().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'nome' é obrigatório.");
        }

        if (cliente.getTelefone() == null || cliente.getTelefone().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'telefone' é obrigatório.");
        }

        // Validação de unicidade no banco
        if (cliente.getCpfCnpj() != null && !cliente.getCpfCnpj().trim().isEmpty()) {
            if (repository.findByCpfCnpj(cliente.getCpfCnpj()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF/CNPJ já cadastrado.");
            }
        }

        if (cliente.getAtivo() == null) {
            cliente.setAtivo(true);
        }

        return repository.save(cliente);
    }

    @Transactional
    public ClienteEntity atualizar(int id, ClienteEntity cliente) {
        ClienteEntity clienteExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        if (cliente == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (cliente.getNome() != null && !cliente.getNome().trim().isEmpty()) {
            clienteExistente.setNome(cliente.getNome());
        }

        if (cliente.getTelefone() != null && !cliente.getTelefone().trim().isEmpty()) {
            clienteExistente.setTelefone(cliente.getTelefone());
        }

        if (cliente.getCpfCnpj() != null && !cliente.getCpfCnpj().trim().isEmpty()) {
            clienteExistente.setCpfCnpj(cliente.getCpfCnpj());
        }

        if (cliente.getEmail() != null) {
            clienteExistente.setEmail(cliente.getEmail());
        }

        if (cliente.getEndereco() != null) {
            clienteExistente.setEndereco(cliente.getEndereco());
        }

        if (cliente.getAtivo() != null) {
            clienteExistente.setAtivo(cliente.getAtivo());
        }

        return repository.save(clienteExistente);
    }

    @Transactional
    public void deletar(int id) {
        ClienteEntity cliente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
        cliente.setAtivo(false);
        repository.save(cliente);
    }
}
