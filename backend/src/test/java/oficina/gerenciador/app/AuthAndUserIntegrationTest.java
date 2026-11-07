package oficina.gerenciador.app;

import com.fasterxml.jackson.databind.ObjectMapper;
import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.model.request.CriarUsuarioRequest;
import oficina.gerenciador.app.model.request.LoginRequest;
import oficina.gerenciador.app.repository.UsuarioRepository;
import oficina.gerenciador.app.util.Md5Util;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
class AuthAndUserIntegrationTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext webApplicationContext;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void setUp() {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(webApplicationContext).build();
    }

    @Test
    @DisplayName("Endpoint de login (/auth/login e /login) deve ser público e autenticar a conta inicial admin com senha 1234")
    void testAdminLoginSucesso() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@oficina.com")
                .senha("1234")
                .build();

        // Testa /auth/login
        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.tipo", is("Bearer")))
                .andExpect(jsonPath("$.usuario.email", is("admin@oficina.com")))
                .andExpect(jsonPath("$.usuario.perfil", is("admin")))
                .andExpect(jsonPath("$.usuario.nome", is("Administrador")));

        // Testa alias /login
        mockMvc.perform(post("/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty());
    }

    @Test
    @DisplayName("Admin deve poder fazer login utilizando apenas 'admin' como identificador")
    void testAdminLoginComUsernameSimples() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin")
                .senha("1234")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.perfil", is("admin")));
    }

    @Test
    @DisplayName("Login com senha incorreta deve retornar 401 Unauthorized")
    void testLoginSenhaIncorreta() throws Exception {
        LoginRequest loginRequest = LoginRequest.builder()
                .email("admin@oficina.com")
                .senha("senha_errada")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Endpoints protegidos devem rejeitar requisições sem token (401)")
    void testEndpointProtegidoSemTokenRetorna401() throws Exception {
        mockMvc.perform(get("/usuarios"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/auth/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/usuarios")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin autenticado pode criar outro usuário e este pode fazer login")
    void testAdminCriaUsuarioEOperacionalLoga() throws Exception {
        // 1. Login como admin
        LoginRequest adminLogin = LoginRequest.builder()
                .email("admin@oficina.com")
                .senha("1234")
                .build();

        MvcResult loginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(adminLogin)))
                .andExpect(status().isOk())
                .andReturn();

        String tokenAdmin = objectMapper.readTree(loginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 2. Admin cria novo usuário operacional
        String novoEmail = "mecanico" + System.currentTimeMillis() + "@oficina.com";
        CriarUsuarioRequest novoUsuario = CriarUsuarioRequest.builder()
                .nome("Carlos Mecânico")
                .email(novoEmail)
                .senha("senha123")
                .perfil("operational")
                .build();

        mockMvc.perform(post("/usuarios")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoUsuario)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.nome", is("Carlos Mecânico")))
                .andExpect(jsonPath("$.email", is(novoEmail)))
                .andExpect(jsonPath("$.perfil", is("operational")));

        // 3. Novo usuário consegue fazer login
        LoginRequest userLogin = LoginRequest.builder()
                .email(novoEmail)
                .senha("senha123")
                .build();

        MvcResult userLoginResult = mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(userLogin)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.usuario.perfil", is("operational")))
                .andReturn();

        String tokenOperacional = objectMapper.readTree(userLoginResult.getResponse().getContentAsString())
                .get("token").asText();

        // 4. Usuário operacional tenta criar outro usuário -> deve receber 403 Forbidden
        CriarUsuarioRequest tentativaProibida = CriarUsuarioRequest.builder()
                .nome("Tentativa Ilegal")
                .email("hacker@teste.com")
                .senha("123456")
                .perfil("operational")
                .build();

        mockMvc.perform(post("/usuarios")
                        .header("Authorization", "Bearer " + tokenOperacional)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(tentativaProibida)))
                .andExpect(status().isForbidden());

        // 5. Tentativa de cadastrar o mesmo e-mail deve falhar com 409 Conflict
        mockMvc.perform(post("/usuarios")
                        .header("Authorization", "Bearer " + tokenAdmin)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(novoUsuario)))
                .andExpect(status().isConflict());

        // 6. Admin lista usuários
        mockMvc.perform(get("/usuarios")
                        .header("Authorization", "Bearer " + tokenAdmin))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @DisplayName("Usuário inativo não deve conseguir fazer login (401)")
    void testUsuarioInativoNaoPodeLogar() throws Exception {
        String emailInativo = "inativo" + System.currentTimeMillis() + "@oficina.com";
        UsuarioEntity inativo = UsuarioEntity.builder()
                .nome("Usuário Inativo")
                .email(emailInativo)
                .senhaHash(Md5Util.hash("1234"))
                .perfil("operational")
                .ativo(false)
                .build();
        usuarioRepository.save(inativo);

        LoginRequest loginRequest = LoginRequest.builder()
                .email(emailInativo)
                .senha("1234")
                .build();

        mockMvc.perform(post("/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized());
    }
}
