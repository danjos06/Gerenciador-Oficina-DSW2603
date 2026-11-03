package oficina.gerenciador.app.util;

import io.jsonwebtoken.Claims;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

/**
 * Intercepta as rotas protegidas, valida o JWT do header
 * "Authorization: Bearer <token>" e guarda os dados do usuário autenticado na requisição.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_CONTA_ID = "contaId";
    public static final String ATRIBUTO_USUARIO_ID = "usuarioId";
    public static final String ATRIBUTO_ROLE = "role";
    public static final String ATRIBUTO_EMAIL = "email";
    public static final String ATRIBUTO_NAME = "name";

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token não informado");
        }

        String token = header.substring(7).trim();
        Claims claims = jwtUtil.validarTokenEObterClaims(token);

        try {
            Integer usuarioId = Integer.valueOf(claims.getSubject());
            String role = claims.get("role", String.class);
            String email = claims.get("email", String.class);
            String name = claims.get("name", String.class);

            request.setAttribute(ATRIBUTO_USUARIO_ID, usuarioId);
            request.setAttribute(ATRIBUTO_CONTA_ID, usuarioId.longValue());
            request.setAttribute(ATRIBUTO_ROLE, role);
            request.setAttribute(ATRIBUTO_EMAIL, email);
            request.setAttribute(ATRIBUTO_NAME, name);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token inválido");
        }

        return true;
    }
}
