package oficina.gerenciador.app.model.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public enum StatusOrdem {
    ABERTA("Aberta"),
    EM_ANDAMENTO("Em andamento"),
    AGUARDANDO_PECA("Aguardando peça"),
    CONCLUIDA("Concluida"),
    ENTREGUE("Entregue"),
    CANCELADA("Cancelada");

    private final String desc;

    StatusOrdem(String desc) {
        this.desc = desc;
    }

    public String getDesc() {
        return this.desc;
    }

    public boolean isFinalizado() {
        return this == CONCLUIDA || this == ENTREGUE || this == CANCELADA;
    }

    @JsonCreator
    public static StatusOrdem deValor(String valor) {
        if (valor == null || valor.trim().isEmpty()) {
            return null;
        }
        String limpo = valor.trim();
        for (StatusOrdem status : values()) {
            if (status.name().equalsIgnoreCase(limpo) || status.desc.equalsIgnoreCase(limpo)) {
                return status;
            }
        }
        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status de ordem inválido: " + valor);
    }

    @Override
    public String toString() {
        return this.desc;
    }
}
