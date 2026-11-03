package oficina.gerenciador.app.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

@Component
public class JwtUtil {

    private static final String DEFAULT_SECRET = "diario-online-chave-secreta-com-no-minimo-32-caracteres";
    private static final long DEFAULT_EXPIRACAO_MINUTOS = 120;

    private final SecretKey chave;
    private final long expiracaoMinutos;

    public JwtUtil(
            @Value("${jwt.secret:diario-online-chave-secreta-com-no-minimo-32-caracteres}") String secret,
            @Value("${jwt.expiracao-minutos:120}") long expiracaoMinutos
    ) {
        String chaveFinal = secret;
        if (chaveFinal == null || chaveFinal.trim().length() < 32) {
            chaveFinal = DEFAULT_SECRET;
        }
        this.chave = Keys.hmacShaKeyFor(chaveFinal.getBytes(StandardCharsets.UTF_8));
        this.expiracaoMinutos = expiracaoMinutos > 0 ? expiracaoMinutos : DEFAULT_EXPIRACAO_MINUTOS;
    }

    public JwtUtil() {
        this(DEFAULT_SECRET, DEFAULT_EXPIRACAO_MINUTOS);
    }

    public String gerarToken(Integer usuarioId, String email, String role, String name) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuarioId))
                .claim("email", email)
                .claim("role", role)
                .claim("name", name)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(expiracaoMinutos, ChronoUnit.MINUTES)))
                .signWith(chave)
                .compact();
    }

    public String gerarToken(Long contaId, String email) {
        return gerarToken(contaId != null ? contaId.intValue() : 0, email, "operational", email);
    }

    /** Valida o token e devolve as claims. Devolve 401 se inválido/expirado. */
    public Claims validarTokenEObterClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou expirado");
        }
    }

    /** Valida o token e devolve o id da conta (compatibilidade com versão anterior). */
    public Long validarToken(String token) {
        Claims claims = validarTokenEObterClaims(token);
        return Long.valueOf(claims.getSubject());
    }

    public Integer obterIdDoToken(String token) {
        Claims claims = validarTokenEObterClaims(token);
        return Integer.valueOf(claims.getSubject());
    }

    public String obterRoleDoToken(String token) {
        Claims claims = validarTokenEObterClaims(token);
        return claims.get("role", String.class);
    }
}
