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
import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.service.OrdemPecaService;

@RestController
@RequestMapping("/ordem-pecas")
@RequiredArgsConstructor
public class OrdemPecaController {
    private final OrdemPecaService service;

    @GetMapping
    public List<OrdemPecaEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public OrdemPecaEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/ordem/{ordemId}")
    public List<OrdemPecaEntity> listarPorOrdem(@PathVariable int ordemId) {
        return service.listarPorOrdem(ordemId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public OrdemPecaEntity adicionar(@RequestBody OrdemPecaEntity ordemPeca) {
        return service.adicionar(ordemPeca);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public OrdemPecaEntity atualizar(@PathVariable int id, @RequestBody OrdemPecaEntity ordemPeca) {
        return service.atualizar(id, ordemPeca);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
