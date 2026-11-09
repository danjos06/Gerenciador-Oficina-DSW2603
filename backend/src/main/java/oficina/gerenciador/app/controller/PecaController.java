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
import oficina.gerenciador.app.model.entity.PecaEntity;
import oficina.gerenciador.app.service.PecaService;

@RestController
@RequestMapping("/pecas")
@RequiredArgsConstructor
public class PecaController {
    private final PecaService service;

    @GetMapping
    public List<PecaEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public PecaEntity buscarPorId(@PathVariable int id) {
        return service.buscarPorId(id);
    }

    @GetMapping("/codigo/{codigo}")
    public PecaEntity buscarPorCodigo(@PathVariable String codigo) {
        return service.buscarPorCodigo(codigo);
    }

    @GetMapping("/nome/{nome}")
    public List<PecaEntity> listarPorNome(@PathVariable String nome) {
        return service.listarPorNome(nome);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PecaEntity adicionar(@RequestBody PecaEntity peca) {
        return service.adicionar(peca);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public PecaEntity atualizar(@PathVariable int id, @RequestBody PecaEntity peca) {
        return service.atualizar(id, peca);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
