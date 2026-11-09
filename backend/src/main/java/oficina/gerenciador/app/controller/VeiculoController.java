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
import oficina.gerenciador.app.model.entity.VeiculoEntity;
import oficina.gerenciador.app.service.VeiculoService;

@RestController
@RequestMapping("/veiculos")
@RequiredArgsConstructor
public class VeiculoController {
    private final VeiculoService service;

    @GetMapping
    public List<VeiculoEntity> listarTodos() {
        return service.listarTodos();
    }

    @GetMapping("/{placa}")
    public VeiculoEntity buscarPorPlaca(@PathVariable String placa) {
        return service.buscarPorPlaca(placa);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public VeiculoEntity adicionar(@RequestBody VeiculoEntity veiculo) {
        return service.adicionar(veiculo);
    }

    @PutMapping("/{id}")
    public VeiculoEntity atualizar(@PathVariable int id, @RequestBody VeiculoEntity veiculo) {
        return service.atualizar(id, veiculo);
    }

    @DeleteMapping("/{id}")
    public void deletar(@PathVariable int id) {
        service.deletar(id);
    }

}
