package oficina.gerenciador.app.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import oficina.gerenciador.app.model.entity.CustomerEntity;
import oficina.gerenciador.app.service.CustomerService;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController 
@RequestMapping("/customers")
@RequiredArgsConstructor 
public class CustomerController {
    private final CustomerService service;

    @GetMapping
    public List<CustomerEntity> listAll(){
        return service.listAll();
    }
    
    @GetMapping("/{phone}")
    public CustomerEntity findByPhone(@PathVariable String phone) {
        return service.findByPhone(phone);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerEntity add(@RequestBody CustomerEntity customer) {
        return service.add(customer);
    }

    @PostMapping("/{phone}")
    @ResponseStatus(HttpStatus.CREATED)
    public CustomerEntity update(@RequestBody CustomerEntity customer) {
        return service.add(customer);
    }
}

