package oficina.gerenciador.app.service;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.VeiculoEntity;
import oficina.gerenciador.app.repository.VeiculoRepository;

@Service
public class VeiculoService {
    private final VeiculoRepository repository;

    public VeiculoService(VeiculoRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public List<VeiculoEntity> listarTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public VeiculoEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado para o ID: " + id));
    }

    @Transactional(readOnly = true)
    public VeiculoEntity buscarPorPlaca(String placa) {
        return repository.findByPlaca(placa)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado para a placa: " + placa));
    }

    @Transactional(readOnly = true)
    public List<VeiculoEntity> listarPorCliente(int clienteId) {
        return repository.findByClienteId(clienteId);
    }

    @Transactional
    public VeiculoEntity adicionar(VeiculoEntity veiculo) {
        if (veiculo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (veiculo.getPlaca() == null || veiculo.getPlaca().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'placa' é obrigatório.");
        }

        if (veiculo.getMarca() == null || veiculo.getMarca().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'marca' é obrigatório.");
        }

        if (veiculo.getModelo() == null || veiculo.getModelo().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'modelo' é obrigatório.");
        }

        if (veiculo.getCliente() == null || veiculo.getCliente().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'cliente' é obrigatório.");
        }

        // Validação de unicidade no banco
        if (repository.findByPlaca(veiculo.getPlaca()).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Placa já cadastrada.");
        }

        if (veiculo.getAtivo() == null) {
            veiculo.setAtivo(true);
        }

        return repository.save(veiculo);
    }

    @Transactional
    public VeiculoEntity atualizar(int id, VeiculoEntity veiculo) {
        VeiculoEntity veiculoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado para o ID: " + id));

        if (veiculo == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (veiculo.getPlaca() != null && !veiculo.getPlaca().trim().isEmpty()) {
            veiculoExistente.setPlaca(veiculo.getPlaca());
        }

        if (veiculo.getMarca() != null && !veiculo.getMarca().trim().isEmpty()) {
            veiculoExistente.setMarca(veiculo.getMarca());
        }

        if (veiculo.getModelo() != null && !veiculo.getModelo().trim().isEmpty()) {
            veiculoExistente.setModelo(veiculo.getModelo());
        }

        if (veiculo.getAno() != null) {
            veiculoExistente.setAno(veiculo.getAno());
        }

        if (veiculo.getCor() != null) {
            veiculoExistente.setCor(veiculo.getCor());
        }

        if (veiculo.getCliente() != null && veiculo.getCliente().getId() != null) {
            veiculoExistente.setCliente(veiculo.getCliente());
        }

        if (veiculo.getAtivo() != null) {
            veiculoExistente.setAtivo(veiculo.getAtivo());
        }

        return repository.save(veiculoExistente);
    }

    @Transactional
    public void deletar(int id) {
        VeiculoEntity veiculoExistente = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado para o ID: " + id));
        veiculoExistente.setAtivo(false);
        repository.save(veiculoExistente);
    }
}
