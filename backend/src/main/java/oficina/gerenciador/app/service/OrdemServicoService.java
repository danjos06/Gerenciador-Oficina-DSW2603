package oficina.gerenciador.app.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.model.entity.PecaEntity;
import oficina.gerenciador.app.model.entity.ServicoEntity;
import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.repository.HistoricoStatusOrdemRepository;
import oficina.gerenciador.app.repository.OrdemItemServicoRepository;
import oficina.gerenciador.app.repository.OrdemPecaRepository;
import oficina.gerenciador.app.repository.OrdemServicoRepository;
import oficina.gerenciador.app.repository.PecaRepository;
import oficina.gerenciador.app.repository.ServicoRepository;
import oficina.gerenciador.app.repository.UsuarioRepository;

@Service
public class OrdemServicoService {

    private static final Set<String> STATUS_FINALIZADOS = Set.of("concluida", "entregue", "cancelada");

    private final OrdemServicoRepository repository;
    private final OrdemPecaRepository ordemPecaRepository;
    private final OrdemItemServicoRepository ordemItemServicoRepository;
    private final HistoricoStatusOrdemRepository historicoRepository;
    private final PecaRepository pecaRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;

    public OrdemServicoService(
            OrdemServicoRepository repository,
            OrdemPecaRepository ordemPecaRepository,
            OrdemItemServicoRepository ordemItemServicoRepository,
            HistoricoStatusOrdemRepository historicoRepository,
            PecaRepository pecaRepository,
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository
    ) {
        this.repository = repository;
        this.ordemPecaRepository = ordemPecaRepository;
        this.ordemItemServicoRepository = ordemItemServicoRepository;
        this.historicoRepository = historicoRepository;
        this.pecaRepository = pecaRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
    }

    // =========================================================================
    // ORDEM DE SERVIÇO
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OrdemServicoEntity> listarTodos() {
        return repository.findAll();
    }

    @Transactional(readOnly = true)
    public OrdemServicoEntity buscarPorId(int id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Ordem de serviço não encontrada para o ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoEntity> listarPorCliente(int clienteId) {
        return repository.findByClienteId(clienteId);
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoEntity> listarPorVeiculo(int veiculoId) {
        return repository.findByVeiculoId(veiculoId);
    }

    @Transactional(readOnly = true)
    public List<OrdemServicoEntity> listarPorStatus(String status) {
        return repository.findByStatusIgnoreCase(status);
    }

    @Transactional
    public OrdemServicoEntity adicionar(OrdemServicoEntity ordem) {
        return adicionar(ordem, null);
    }

    @Transactional
    public OrdemServicoEntity adicionar(OrdemServicoEntity ordem, Integer usuarioLogadoId) {
        if (ordem == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordem.getCliente() == null || ordem.getCliente().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'cliente' é obrigatório.");
        }

        if (ordem.getVeiculo() == null || ordem.getVeiculo().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'veiculo' é obrigatório.");
        }

        if ((ordem.getCriadoPor() == null || ordem.getCriadoPor().getId() == null) && usuarioLogadoId != null) {
            UsuarioEntity criador = usuarioRepository.findById(usuarioLogadoId)
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Usuário autenticado não encontrado."));
            ordem.setCriadoPor(criador);
        }

        if (ordem.getCriadoPor() == null || ordem.getCriadoPor().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'criadoPor' é obrigatório.");
        }

        if (ordem.getProblemaRelatado() == null || ordem.getProblemaRelatado().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'problemaRelatado' é obrigatório.");
        }

        if (ordem.getQuilometragem() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'quilometragem' é obrigatório.");
        }

        if (ordem.getStatus() == null || ordem.getStatus().trim().isEmpty()) {
            ordem.setStatus("aberta");
        } else {
            ordem.setStatus(ordem.getStatus().trim().toLowerCase());
        }

        if (ordem.getDesconto() == null) {
            ordem.setDesconto(BigDecimal.ZERO);
        }

        OrdemServicoEntity salva = repository.save(ordem);

        registrarHistorico(salva, salva.getCriadoPor(), null, salva.getStatus(), "Ordem de serviço criada");

        return salva;
    }

    @Transactional
    public OrdemServicoEntity atualizar(int id, OrdemServicoEntity ordem) {
        return atualizar(id, ordem, null);
    }

    @Transactional
    public OrdemServicoEntity atualizar(int id, OrdemServicoEntity ordem, Integer usuarioLogadoId) {
        OrdemServicoEntity ordemExistente = buscarPorId(id);

        if (ordem == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (ordem.getCliente() != null && ordem.getCliente().getId() != null) {
            ordemExistente.setCliente(ordem.getCliente());
        }

        if (ordem.getVeiculo() != null && ordem.getVeiculo().getId() != null) {
            ordemExistente.setVeiculo(ordem.getVeiculo());
        }

        if (ordem.getMecanico() != null) {
            ordemExistente.setMecanico(ordem.getMecanico());
        }

        if (ordem.getOrdemOrigem() != null) {
            ordemExistente.setOrdemOrigem(ordem.getOrdemOrigem());
        }

        if (ordem.getProblemaRelatado() != null && !ordem.getProblemaRelatado().trim().isEmpty()) {
            ordemExistente.setProblemaRelatado(ordem.getProblemaRelatado());
        }

        if (ordem.getObservacoes() != null) {
            ordemExistente.setObservacoes(ordem.getObservacoes());
        }

        if (ordem.getQuilometragem() != null) {
            ordemExistente.setQuilometragem(ordem.getQuilometragem());
        }

        if (ordem.getDesconto() != null) {
            ordemExistente.setDesconto(ordem.getDesconto());
        }

        if (ordem.getDiasGarantia() != null) {
            ordemExistente.setDiasGarantia(ordem.getDiasGarantia());
        }

        if (ordem.getKmGarantia() != null) {
            ordemExistente.setKmGarantia(ordem.getKmGarantia());
        }

        if (ordem.getPrevisaoEntrega() != null) {
            ordemExistente.setPrevisaoEntrega(ordem.getPrevisaoEntrega());
        }

        if (ordem.getConcluidoEm() != null) {
            ordemExistente.setConcluidoEm(ordem.getConcluidoEm());
        }

        if (ordem.getEntregueEm() != null) {
            ordemExistente.setEntregueEm(ordem.getEntregueEm());
        }

        String statusAnterior = ordemExistente.getStatus();
        String novoStatus = ordem.getStatus() != null ? ordem.getStatus().trim().toLowerCase() : null;
        boolean mudouStatus = novoStatus != null && !novoStatus.isEmpty() && !novoStatus.equalsIgnoreCase(statusAnterior);

        if (mudouStatus) {
            aplicarMudancaDeStatus(ordemExistente, novoStatus);
        }

        OrdemServicoEntity atualizada = repository.save(ordemExistente);

        if (mudouStatus) {
            UsuarioEntity autor = obterUsuarioAutor(usuarioLogadoId, atualizada.getCriadoPor());
            registrarHistorico(atualizada, autor, statusAnterior, novoStatus, "Status atualizado via edição da OS");
        }

        return atualizada;
    }

    @Transactional
    public OrdemServicoEntity atualizarStatus(int id, String novoStatus, String justificativa, Integer usuarioLogadoId) {
        OrdemServicoEntity ordemExistente = buscarPorId(id);

        if (novoStatus == null || novoStatus.trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'novoStatus' é obrigatório.");
        }

        String statusFormatado = novoStatus.trim().toLowerCase();
        String statusAnterior = ordemExistente.getStatus();

        if (statusFormatado.equalsIgnoreCase(statusAnterior)) {
            return ordemExistente;
        }

        aplicarMudancaDeStatus(ordemExistente, statusFormatado);
        OrdemServicoEntity atualizada = repository.save(ordemExistente);

        UsuarioEntity autor = obterUsuarioAutor(usuarioLogadoId, atualizada.getCriadoPor());
        registrarHistorico(atualizada, autor, statusAnterior, statusFormatado, justificativa);

        return atualizada;
    }

    @Transactional
    public void deletar(int id) {
        cancelar(id, null);
    }

    @Transactional
    public void cancelar(int id, Integer usuarioLogadoId) {
        OrdemServicoEntity ordemExistente = buscarPorId(id);
        String statusAnterior = ordemExistente.getStatus();

        if ("cancelada".equalsIgnoreCase(statusAnterior)) {
            return;
        }

        ordemExistente.setStatus("cancelada");
        OrdemServicoEntity salva = repository.save(ordemExistente);

        UsuarioEntity autor = obterUsuarioAutor(usuarioLogadoId, salva.getCriadoPor());
        registrarHistorico(salva, autor, statusAnterior, "cancelada", "Ordem de serviço cancelada");
    }

    // =========================================================================
    // PEÇAS DA ORDEM DE SERVIÇO
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OrdemPecaEntity> listarPecasPorOrdem(int ordemId) {
        buscarPorId(ordemId);
        return ordemPecaRepository.findByOrdemId(ordemId);
    }

    @Transactional
    public OrdemPecaEntity adicionarPeca(int ordemId, OrdemPecaEntity itemPeca) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        if (itemPeca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (itemPeca.getPeca() == null || itemPeca.getPeca().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'peca' é obrigatório.");
        }

        PecaEntity peca = pecaRepository.findById(itemPeca.getPeca().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Peça não encontrada no catálogo."));

        itemPeca.setOrdem(ordem);
        itemPeca.setPeca(peca);

        if (itemPeca.getPrecoUnitario() == null) {
            itemPeca.setPrecoUnitario(peca.getPrecoReferencia());
        }

        if (itemPeca.getQuantidade() == null || itemPeca.getQuantidade() <= 0) {
            itemPeca.setQuantidade(1);
        }

        if (itemPeca.getOrigem() == null || itemPeca.getOrigem().trim().isEmpty()) {
            itemPeca.setOrigem("nova");
        }

        if (itemPeca.getPendente() == null) {
            itemPeca.setPendente(false);
        }

        return ordemPecaRepository.save(itemPeca);
    }

    @Transactional
    public OrdemPecaEntity atualizarPeca(int ordemId, int itemPecaId, OrdemPecaEntity itemPeca) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        if (itemPeca == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        OrdemPecaEntity existente = ordemPecaRepository.findById(itemPecaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de peça não encontrado para o ID: " + itemPecaId));

        if (!existente.getOrdem().getId().equals(ordemId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta peça não pertence à ordem de serviço informada.");
        }

        if (itemPeca.getQuantidade() != null && itemPeca.getQuantidade() > 0) {
            existente.setQuantidade(itemPeca.getQuantidade());
        }

        if (itemPeca.getPrecoUnitario() != null) {
            existente.setPrecoUnitario(itemPeca.getPrecoUnitario());
        }

        if (itemPeca.getOrigem() != null && !itemPeca.getOrigem().trim().isEmpty()) {
            existente.setOrigem(itemPeca.getOrigem());
        }

        if (itemPeca.getPendente() != null) {
            existente.setPendente(itemPeca.getPendente());
        }

        if (itemPeca.getPrevisaoChegada() != null) {
            existente.setPrevisaoChegada(itemPeca.getPrevisaoChegada());
        }

        return ordemPecaRepository.save(existente);
    }

    @Transactional
    public void removerPeca(int ordemId, int itemPecaId) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        OrdemPecaEntity existente = ordemPecaRepository.findById(itemPecaId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de peça não encontrado para o ID: " + itemPecaId));

        if (!existente.getOrdem().getId().equals(ordemId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Esta peça não pertence à ordem de serviço informada.");
        }

        ordemPecaRepository.delete(existente);
    }

    // =========================================================================
    // SERVIÇOS DA ORDEM DE SERVIÇO
    // =========================================================================

    @Transactional(readOnly = true)
    public List<OrdemItemServicoEntity> listarServicosPorOrdem(int ordemId) {
        buscarPorId(ordemId);
        return ordemItemServicoRepository.findByOrdemId(ordemId);
    }

    @Transactional
    public OrdemItemServicoEntity adicionarServico(int ordemId, OrdemItemServicoEntity itemServico) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        if (itemServico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        if (itemServico.getServico() == null || itemServico.getServico().getId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'servico' é obrigatório.");
        }

        ServicoEntity servico = servicoRepository.findById(itemServico.getServico().getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Serviço não encontrado no catálogo."));

        itemServico.setOrdem(ordem);
        itemServico.setServico(servico);

        if (itemServico.getPrecoUnitario() == null) {
            itemServico.setPrecoUnitario(servico.getPrecoReferencia());
        }

        if (itemServico.getQuantidade() == null || itemServico.getQuantidade() <= 0) {
            itemServico.setQuantidade(1);
        }

        if (itemServico.getExtra() == null) {
            itemServico.setExtra(false);
        }

        if (itemServico.getMetodoAprovacao() != null && !itemServico.getMetodoAprovacao().trim().isEmpty()
                && itemServico.getAprovadoEm() == null) {
            itemServico.setAprovadoEm(LocalDateTime.now());
        }

        return ordemItemServicoRepository.save(itemServico);
    }

    @Transactional
    public OrdemItemServicoEntity atualizarServico(int ordemId, int itemServicoId, OrdemItemServicoEntity itemServico) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        if (itemServico == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Corpo da requisição ausente.");
        }

        OrdemItemServicoEntity existente = ordemItemServicoRepository.findById(itemServicoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de serviço não encontrado para o ID: " + itemServicoId));

        if (!existente.getOrdem().getId().equals(ordemId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este serviço não pertence à ordem de serviço informada.");
        }

        if (itemServico.getQuantidade() != null && itemServico.getQuantidade() > 0) {
            existente.setQuantidade(itemServico.getQuantidade());
        }

        if (itemServico.getPrecoUnitario() != null) {
            existente.setPrecoUnitario(itemServico.getPrecoUnitario());
        }

        if (itemServico.getExtra() != null) {
            existente.setExtra(itemServico.getExtra());
        }

        if (itemServico.getMetodoAprovacao() != null) {
            existente.setMetodoAprovacao(itemServico.getMetodoAprovacao());
            if (existente.getAprovadoEm() == null && !itemServico.getMetodoAprovacao().trim().isEmpty()) {
                existente.setAprovadoEm(LocalDateTime.now());
            }
        }

        if (itemServico.getAprovadoEm() != null) {
            existente.setAprovadoEm(itemServico.getAprovadoEm());
        }

        return ordemItemServicoRepository.save(existente);
    }

    @Transactional
    public void removerServico(int ordemId, int itemServicoId) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        validarOrdemAbertaParaEdicaoDeItens(ordem);

        OrdemItemServicoEntity existente = ordemItemServicoRepository.findById(itemServicoId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item de serviço não encontrado para o ID: " + itemServicoId));

        if (!existente.getOrdem().getId().equals(ordemId)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este serviço não pertence à ordem de serviço informada.");
        }

        ordemItemServicoRepository.delete(existente);
    }

    // =========================================================================
    // HISTÓRICO DE STATUS (SOMENTE LEITURA EXTERNA / GRAVAÇÃO AUTOMÁTICA)
    // =========================================================================

    @Transactional(readOnly = true)
    public List<HistoricoStatusOrdemEntity> listarHistoricoPorOrdem(int ordemId) {
        buscarPorId(ordemId);
        return historicoRepository.findByOrdemIdOrderByCriadoEmAsc(ordemId);
    }

    // =========================================================================
    // AUXILIARES PRIVADOS
    // =========================================================================

    private void validarOrdemAbertaParaEdicaoDeItens(OrdemServicoEntity ordem) {
        if (ordem.getStatus() != null && STATUS_FINALIZADOS.contains(ordem.getStatus().toLowerCase())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é permitido alterar peças ou serviços de uma ordem com status '" + ordem.getStatus() + "'."
            );
        }
    }

    private void aplicarMudancaDeStatus(OrdemServicoEntity ordem, String novoStatus) {
        ordem.setStatus(novoStatus);
        if ("concluida".equalsIgnoreCase(novoStatus) && ordem.getConcluidoEm() == null) {
            ordem.setConcluidoEm(LocalDateTime.now());
        } else if ("entregue".equalsIgnoreCase(novoStatus)) {
            if (ordem.getConcluidoEm() == null) {
                ordem.setConcluidoEm(LocalDateTime.now());
            }
            if (ordem.getEntregueEm() == null) {
                ordem.setEntregueEm(LocalDateTime.now());
            }
        }
    }

    private UsuarioEntity obterUsuarioAutor(Integer usuarioLogadoId, UsuarioEntity fallback) {
        if (usuarioLogadoId != null) {
            return usuarioRepository.findById(usuarioLogadoId).orElse(fallback);
        }
        return fallback;
    }

    private void registrarHistorico(
            OrdemServicoEntity ordem,
            UsuarioEntity usuario,
            String statusAnterior,
            String novoStatus,
            String justificativa
    ) {
        HistoricoStatusOrdemEntity historico = HistoricoStatusOrdemEntity.builder()
                .ordem(ordem)
                .usuario(usuario)
                .statusAnterior(statusAnterior)
                .novoStatus(novoStatus)
                .justificativa(justificativa)
                .build();
        historicoRepository.save(historico);
    }
}
