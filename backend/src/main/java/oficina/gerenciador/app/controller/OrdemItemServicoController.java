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
import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.service.OrdemItemServicoService;

@RestController
@RequestMapping("/ordem-itens-servico")
@RequiredArgsConstructor
public class OrdemItemServicoController {
    private final OrdemItemServicoService service;

    @GetMapping
    public List<OrdemItemServicoEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public OrdemItemServicoEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/ordem/{ordemId}")
    public List<OrdemItemServicoEntity> listarPorOrdem(@PathVariable int ordemId) {
        return service.listarPorOrdem(ordemId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrdemItemServicoEntity adicionar(@RequestBody OrdemItemServicoEntity item) {
        return service.adicionar(item);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemItemServicoEntity atualizar(@PathVariable int id, @RequestBody OrdemItemServicoEntity item) {
        return service.atualizar(id, item);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
