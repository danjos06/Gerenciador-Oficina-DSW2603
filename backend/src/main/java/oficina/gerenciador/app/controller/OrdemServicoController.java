package oficina.gerenciador.app.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.service.OrdemServicoService;

@RestController
@RequestMapping("/ordens-servico")
@RequiredArgsConstructor
public class OrdemServicoController {
    private final OrdemServicoService service;

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
    public OrdemServicoEntity adicionar(@RequestBody OrdemServicoEntity ordem) {
        return service.adicionar(ordem);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemServicoEntity atualizar(@PathVariable int id, @RequestBody OrdemServicoEntity ordem) {
        return service.atualizar(id, ordem);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
