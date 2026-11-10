package oficina.gerenciador.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum MetodoAprovacao {
    WHATSAPP("Whatsapp"),
    PRESENCIAL("Presencial"),
    TELEFONE("Telefone");

    private final String desc;

    MetodoAprovacao(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return this.desc;
    }

    @JsonCreator
    public static MetodoAprovacao deValor(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        String limpo = valor.trim();
        for (MetodoAprovacao metodo : values()) {
            if (metodo.name().equalsIgnoreCase(limpo) || metodo.desc.equalsIgnoreCase(limpo)) {
                return metodo;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Método de aprovação inválido: " + valor);
    }

    @Override
    public String toString() {
        return this.desc;
    }
}
