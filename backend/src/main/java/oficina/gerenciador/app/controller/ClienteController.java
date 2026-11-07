package oficina.gerenciador.app.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import oficina.gerenciador.app.model.entity.ClienteEntity;
import oficina.gerenciador.app.service.ClienteService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping("/clientes")
@RequiredArgsConstructor
public class ClienteController {
    private final ClienteService service;

    @GetMapping
    public List<ClienteEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{telefone}")
    public ClienteEntity buscarPorTelefone(@PathVariable String telefone) {
        return service.buscarPorTelefone(telefone);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ClienteEntity adicionar(@RequestBody ClienteEntity cliente) {
        return service.adicionar(cliente);
    }

    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public ClienteEntity atualizar(@PathVariable int id, @RequestBody ClienteEntity cliente) {
        return service.atualizar(id, cliente);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }
}
