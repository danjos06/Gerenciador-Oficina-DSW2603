package oficina.gerenciador.app.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import oficina.gerenciador.app.model.entity.ClienteEntity;
import oficina.gerenciador.app.model.entity.HistoricoStatusOrdemEntity;
import oficina.gerenciador.app.model.entity.OrdemItemServicoEntity;
import oficina.gerenciador.app.model.entity.OrdemPecaEntity;
import oficina.gerenciador.app.model.entity.OrdemServicoEntity;
import oficina.gerenciador.app.model.entity.PecaEntity;
import oficina.gerenciador.app.model.entity.ServicoEntity;
import oficina.gerenciador.app.model.entity.UsuarioEntity;
import oficina.gerenciador.app.model.entity.VeiculoEntity;
import oficina.gerenciador.app.model.enums.OrigemPeca;
import oficina.gerenciador.app.model.enums.StatusOrdem;
import oficina.gerenciador.app.model.response.OrdemServicoResumoResponse;
import oficina.gerenciador.app.repository.ClienteRepository;
import oficina.gerenciador.app.repository.HistoricoStatusOrdemRepository;
import oficina.gerenciador.app.repository.OrdemItemServicoRepository;
import oficina.gerenciador.app.repository.OrdemPecaRepository;
import oficina.gerenciador.app.repository.OrdemServicoRepository;
import oficina.gerenciador.app.repository.PecaRepository;
import oficina.gerenciador.app.repository.ServicoRepository;
import oficina.gerenciador.app.repository.UsuarioRepository;
import oficina.gerenciador.app.repository.VeiculoRepository;

@Service
public class OrdemServicoService {
    private final OrdemServicoRepository repository;
    private final OrdemPecaRepository ordemPecaRepository;
    private final OrdemItemServicoRepository ordemItemServicoRepository;
    private final HistoricoStatusOrdemRepository historicoRepository;
    private final PecaRepository pecaRepository;
    private final ServicoRepository servicoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final VeiculoRepository veiculoRepository;

    public OrdemServicoService(
            OrdemServicoRepository repository,
            OrdemPecaRepository ordemPecaRepository,
            OrdemItemServicoRepository ordemItemServicoRepository,
            HistoricoStatusOrdemRepository historicoRepository,
            PecaRepository pecaRepository,
            ServicoRepository servicoRepository,
            UsuarioRepository usuarioRepository,
            ClienteRepository clienteRepository,
            VeiculoRepository veiculoRepository
    ) {
        this.repository = repository;
        this.ordemPecaRepository = ordemPecaRepository;
        this.ordemItemServicoRepository = ordemItemServicoRepository;
        this.historicoRepository = historicoRepository;
        this.pecaRepository = pecaRepository;
        this.servicoRepository = servicoRepository;
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.veiculoRepository = veiculoRepository;
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
        StatusOrdem statusEnum = StatusOrdem.deValor(status);
        if (statusEnum == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O parâmetro 'status' é obrigatório.");
        }
        return repository.findByStatus(statusEnum);
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

        ClienteEntity cliente = clienteRepository.findById(ordem.getCliente().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));

        VeiculoEntity veiculo = veiculoRepository.findById(ordem.getVeiculo().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veiculo não encontrado."));

        if(!veiculo.getCliente().getId().equals(cliente.getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O veículo informado não pertence a este cliente.");
        }

        ordem.setCliente(cliente);
        ordem.setVeiculo(veiculo);

        if (ordem.getStatus() == null) {
            ordem.setStatus(StatusOrdem.ABERTA);
        }

        if (ordem.getDesconto() == null) {
            ordem.setDesconto(BigDecimal.ZERO);
        }

        if (ordem.getMecanico() != null && ordem.getMecanico().getId() != null) {
            UsuarioEntity mecanico = usuarioRepository.findById(ordem.getMecanico().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mecânico não encontrado."));
            ordem.setMecanico(mecanico);
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
            ClienteEntity cliente = clienteRepository.findById(ordem.getCliente().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente não encontrado."));
            ordemExistente.setCliente(cliente);
        }

        if (ordem.getVeiculo() != null && ordem.getVeiculo().getId() != null) {
            VeiculoEntity veiculo = veiculoRepository.findById(ordem.getVeiculo().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Veículo não encontrado."));
            ordemExistente.setVeiculo(veiculo);
        }

        if (!ordemExistente.getVeiculo().getCliente().getId().equals(ordemExistente.getCliente().getId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O veículo informado não pertence a este cliente");
        }

        if (ordem.getMecanico() != null && ordem.getMecanico().getId() != null) {
            UsuarioEntity mecanico = usuarioRepository.findById(ordem.getMecanico().getId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mecânico não encontrado."));
            ordemExistente.setMecanico(mecanico);
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

        StatusOrdem statusAnterior = ordemExistente.getStatus();
        StatusOrdem novoStatus = ordem.getStatus();
        boolean mudouStatus = novoStatus != null && novoStatus != statusAnterior;

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
    public OrdemServicoEntity atualizarStatus(int id, String novoStatusStr, String justificativa, Integer usuarioLogadoId) {
        OrdemServicoEntity ordemExistente = buscarPorId(id);

        StatusOrdem novoStatus = StatusOrdem.deValor(novoStatusStr);
        if (novoStatus == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O campo 'novoStatus' é obrigatório.");
        }

        StatusOrdem statusAnterior = ordemExistente.getStatus();

        if (novoStatus == statusAnterior) {
            return ordemExistente;
        }

        aplicarMudancaDeStatus(ordemExistente, novoStatus);
        OrdemServicoEntity atualizada = repository.save(ordemExistente);

        UsuarioEntity autor = obterUsuarioAutor(usuarioLogadoId, atualizada.getCriadoPor());
        registrarHistorico(atualizada, autor, statusAnterior, novoStatus, justificativa);

        return atualizada;
    }

    @Transactional
    public void deletar(int id) {
        cancelar(id, null);
    }

    @Transactional
    public void cancelar(int id, Integer usuarioLogadoId) {
        OrdemServicoEntity ordemExistente = buscarPorId(id);
        StatusOrdem statusAnterior = ordemExistente.getStatus();

        if (statusAnterior == StatusOrdem.CANCELADA) {
            return;
        }

        ordemExistente.setStatus(StatusOrdem.CANCELADA);
        OrdemServicoEntity salva = repository.save(ordemExistente);

        UsuarioEntity autor = obterUsuarioAutor(usuarioLogadoId, salva.getCriadoPor());
        registrarHistorico(salva, autor, statusAnterior, StatusOrdem.CANCELADA, "Ordem de serviço cancelada");
    }

    @Transactional(readOnly = true)
    public OrdemServicoResumoResponse obterResumo(int ordemId) {
        OrdemServicoEntity ordem = buscarPorId(ordemId);
        List<OrdemPecaEntity> pecas = ordemPecaRepository.findByOrdemId(ordemId);
        List<OrdemItemServicoEntity> servicos = ordemItemServicoRepository.findByOrdemId(ordemId);
        List<HistoricoStatusOrdemEntity> historico = historicoRepository.findByOrdemIdOrderByCriadoEmAsc(ordemId);

        BigDecimal totalPecas = BigDecimal.ZERO;

        for (OrdemPecaEntity p : pecas) {
            BigDecimal subtotal = p.getPrecoUnitario().multiply(BigDecimal.valueOf(p.getQuantidade()));

            totalPecas = totalPecas.add(subtotal);
        }

        BigDecimal totalServicos = BigDecimal.ZERO;

        for(OrdemItemServicoEntity s : servicos) {
            BigDecimal subtotal = s.getPrecoUnitario().multiply(BigDecimal.valueOf(s.getQuantidade()));

            totalServicos = totalServicos.add(subtotal);
        }

        BigDecimal totalBruto = totalPecas.add(totalServicos);

        BigDecimal desconto = ordem.getDesconto() != null ? ordem.getDesconto() : BigDecimal.ZERO;

        BigDecimal valorTotal = totalBruto.subtract(desconto).max(BigDecimal.ZERO);

        return OrdemServicoResumoResponse.builder()
            .ordem(ordem)
            .pecas(pecas)
            .servicos(servicos)
            .historico(historico)
            .totalPecas(totalPecas)
            .totalServicos(totalServicos)
            .totalBruto(totalBruto)
            .desconto(desconto)
            .valorTotal(valorTotal)
            .build();
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

        if (itemPeca.getOrigem() == null) {
            itemPeca.setOrigem(OrigemPeca.NOVA);
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

        if (itemPeca.getOrigem() != null) {
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

        if (itemServico.getMetodoAprovacao() != null && itemServico.getAprovadoEm() == null) {
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
            if (existente.getAprovadoEm() == null) {
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
        if (ordem.getStatus() != null && ordem.getStatus().isFinalizado()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Não é permitido alterar peças ou serviços de uma ordem com status '" + ordem.getStatus() + "'."
            );
        }
    }

    private void aplicarMudancaDeStatus(OrdemServicoEntity ordem, StatusOrdem novoStatus) {
        if (novoStatus == StatusOrdem.CONCLUIDA || novoStatus == StatusOrdem.ENTREGUE) {
            List<OrdemPecaEntity> pecas = ordemPecaRepository.findByOrdemId(ordem.getId());

            for (OrdemPecaEntity p : pecas) {
                if (Boolean.TRUE.equals(p.getPendente())) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível concluir ou entregar a OS pois existem peças pendentes de chegada.");
                }
            }

            List<OrdemItemServicoEntity> servicos = ordemItemServicoRepository.findByOrdemId(ordem.getId());

            for (OrdemItemServicoEntity s : servicos) {
                if (Boolean.TRUE.equals(s.getExtra()) && s.getAprovadoEm() == null) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Não é possível concluir ou entregar a OS pois existem serviços extras aguardando aprovação do cliente.");
                }
            }
        }

        ordem.setStatus(novoStatus);
        if (novoStatus == StatusOrdem.CONCLUIDA && ordem.getConcluidoEm() == null) {
            ordem.setConcluidoEm(LocalDateTime.now());
        } else if (novoStatus == StatusOrdem.ENTREGUE) {
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
            StatusOrdem statusAnterior,
            StatusOrdem novoStatus,
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
