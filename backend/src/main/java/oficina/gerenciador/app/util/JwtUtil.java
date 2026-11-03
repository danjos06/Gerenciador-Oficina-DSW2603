package br.senac.diario.util;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

public class JwtUtil {

    private static final String SECRET = "diario-online-chave-secreta-com-no-minimo-32-caracteres";
    private static final long EXPIRACAO_HORAS = 8;

    private final SecretKey chave = Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));

    public String gerarToken(Long contaId, String email) {
        Instant agora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(contaId))
                .claim("email", email)
                .issuedAt(Date.from(agora))
                .expiration(Date.from(agora.plus(EXPIRACAO_HORAS, ChronoUnit.HOURS)))
                .signWith(chave)
                .compact();
    }

    /** Valida o token e devolve o id da conta. Devolve 401 se inválido/expirado. */
    public Long validarToken(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(chave)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
            return Long.valueOf(claims.getSubject());
        } catch (JwtException | IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido ou expirado");
        }
    }
}
