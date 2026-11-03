package br.senac.diario.util;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;

/**
 * Hash MD5 simples, sem salt.
 * Obs.: serve para fins didáticos; em produção use BCrypt/Argon2.
 */
public final class Md5Util {

    private Md5Util() {
    }

    public static String hash(String texto) {
        try {
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] bytes = md.digest(texto.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(bytes);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("MD5 não disponível", e);
        }
    }
}
