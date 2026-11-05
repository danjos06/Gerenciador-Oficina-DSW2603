package oficina.gerenciador.app.service;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.repository.CustomerRepository;
import oficina.gerenciador.app.model.entity.CustomerEntity;

import java.util.List;

@Service 
public class CustomerService {
    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) { this.repository = repository; }

    @Transactional(readOnly = true)
    public List<CustomerEntity> listAll() { return repository.findAll(); }

    @Transactional(readOnly = true)
    public CustomerEntity findByCpfCnpj(String cpfCnpj) {
        return repository.findByCpfCnpj(cpfCnpj).orElseThrow(() -> new RuntimeException("Cliente não encontrado para o CPF/CNPJ: " + cpfCnpj));
    }

    @Transactional(readOnly = true)
    public CustomerEntity findByPhone(String phone) {
        return repository.findByPhone(phone).orElseThrow(() -> new RuntimeException("Cliente não encontrado para o Telefone: " + phone));
    }

    @Transactional
    public CustomerEntity add(CustomerEntity customer) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (customer.getName() == null || customer.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'name' é obrigatório.");
        }

        if (customer.getPhone() == null || customer.getPhone().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'phone' é obrigatório.");
        }

        // Validação de unicidade no banco
        if (customer.getCpfCnpj() != null && !customer.getCpfCnpj().trim().isEmpty()) {
            if (repository.findByCpfCnpj(customer.getCpfCnpj()).isPresent()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "CPF/CNPJ já cadastrado.");
            }
        }

        if (customer.getActive() == null) {
            customer.setActive(true);
        }

        return repository.save(customer);
    }

    @Transactional
    public CustomerEntity update(CustomerEntity customer) {
        if (customer == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (customer.getName() == null || customer.getName().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'name' é obrigatório.");
        }

        if (customer.getPhone() == null || customer.getPhone().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'phone' é obrigatório.");
        }


        if (customer.getActive() == null) {
            customer.setActive(true);
        }

        return repository.save(customer);
    }

}
