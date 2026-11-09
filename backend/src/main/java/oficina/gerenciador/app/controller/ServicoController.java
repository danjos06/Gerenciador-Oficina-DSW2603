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
import oficina.gerenciador.app.model.entity.ServicoEntity;
import oficina.gerenciador.app.service.ServicoService;

@RestController
@RequestMapping("/servicos")
@RequiredArgsConstructor
public class ServicoController {
    private final ServicoService service;

    @GetMapping
    public List<ServicoEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ServicoEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/nome/{nome}")
    public List<ServicoEntity> listarPorNome(@PathVariable String nome) {
        return service.listarPorNome(nome);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ServicoEntity adicionar(@RequestBody ServicoEntity servico) {
        return service.adicionar(servico);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ServicoEntity atualizar(@PathVariable int id, @RequestBody ServicoEntity servico) {
        return service.atualizar(id, servico);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
