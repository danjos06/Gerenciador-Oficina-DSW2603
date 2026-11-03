package br.senac.diario.util;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Intercepta as rotas protegidas, valida o JWT do header
 * "Authorization: Bearer <token>" e guarda o id da conta na requisição.
 */
public class AuthInterceptor implements HandlerInterceptor {

    public static final String ATRIBUTO_CONTA_ID = "contaId";

    private final JwtUtil jwtUtil;

    public AuthInterceptor(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }
        // cadastro de conta é público
        if ("POST".equalsIgnoreCase(request.getMethod()) && "/contas".equals(request.getRequestURI())) {
            return true;
        }
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header == null || !header.startsWith("Bearer ")) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token não informado");
        }
        Long contaId = jwtUtil.validarToken(header.substring(7));
        request.setAttribute(ATRIBUTO_CONTA_ID, contaId);
        return true;
    }
}
