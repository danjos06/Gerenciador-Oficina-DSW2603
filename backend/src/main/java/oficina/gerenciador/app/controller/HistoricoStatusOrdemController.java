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
import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.service.HistoricoStatusOrdemService;

@RestController
@RequestMapping("/historico-status-ordem")
@RequiredArgsConstructor
public class HistoricoStatusOrdemController {
    private final HistoricoStatusOrdemService service;

    @GetMapping
    public List<HistoricoStatusOrdemEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public HistoricoStatusOrdemEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/ordem/{ordemId}")
    public List<HistoricoStatusOrdemEntity> listarPorOrdem(@PathVariable int ordemId) {
        return service.listarPorOrdem(ordemId);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public HistoricoStatusOrdemEntity adicionar(@RequestBody HistoricoStatusOrdemEntity historico) {
        return service.adicionar(historico);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public HistoricoStatusOrdemEntity atualizar(@PathVariable int id, @RequestBody HistoricoStatusOrdemEntity historico) {
        return service.atualizar(id, historico);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
