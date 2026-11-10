package oficina.gerenciador.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum OrigemPeca {
    NOVA("Nova"),
    USADA("Usada"),
    CLIENTE("Cliente");

    private final String desc;

    OrigemPeca(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return this.desc;
    }

    @JsonCreator
    public static OrigemPeca deValor(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        String limpo = valor.trim();
        for (OrigemPeca origem : values()) {
            if (origem.name().equalsIgnoreCase(limpo) || origem.desc.equalsIgnoreCase(limpo)) {
                return origem;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Origem de peça inválida: " + valor);
    }

    @Override
    public String toString() {
        return this.desc;
    }
}
