USE oficina;

-- =====================================================================
-- 1. CATÁLOGO DE PEÇAS E PRODUTOS (tb_peca)
-- =====================================================================
INSERT INTO tb_peca (nome, codigo, preco_referencia, ativo) VALUES
('Óleo Motor 5W30 Sintético (1L)', 'LUB-5W30-1L', 48.90, 1),
('Óleo Motor 10W40 Semissintético (1L)', 'LUB-10W40-1L', 39.90, 1),
('Filtro de Óleo Motor', 'FLT-OL-001', 35.00, 1),
('Filtro de Ar do Motor', 'FLT-AR-002', 42.50, 1),
('Filtro de Combustível', 'FLT-CB-003', 32.00, 1),
('Filtro de Cabine (Ar-Condicionado)', 'FLT-AC-004', 38.00, 1),
('Jogo de Pastilhas de Freio Dianteiras', 'FR-PAST-D01', 165.00, 1),
('Jogo de Pastilhas de Freio Traseiras', 'FR-PAST-T02', 145.00, 1),
('Par de Discos de Freio Ventilados', 'FR-DISC-V01', 340.00, 1),
('Fluido de Freio DOT 4 (500ml)', 'FR-DOT4-500', 36.00, 1),
('Kit Correia Dentada + Tensor', 'MTR-COR-001', 295.00, 1),
('Correia Poly-V (Alternador)', 'MTR-POLYV-02', 78.00, 1),
('Jogo de Velas de Ignição (4 un.)', 'IGN-VELA-04', 140.00, 1),
('Cabo de Vela (Jogo)', 'IGN-CABO-01', 125.00, 1),
('Bobina de Ignição', 'IGN-BOB-001', 280.00, 1),
('Bateria Automotiva 60Ah', 'ELE-BAT-60A', 460.00, 1),
('Kit Embreagem Completo (Platô + Disco + Rolamento)', 'TRM-EMB-001', 690.00, 1),
('Par de Amortecedores Dianteiros', 'SUS-AMOR-D1', 640.00, 1),
('Par de Amortecedores Traseiros', 'SUS-AMOR-T2', 480.00, 1),
('Kit Batente, Coifa e Coxim do Amortecedor', 'SUS-KIT-003', 160.00, 1),
('Bieleta da Barra Estabilizadora', 'SUS-BIEL-04', 65.00, 1),
('Pivô de Suspensão', 'SUS-PIVO-05', 95.00, 1),
('Terminal de Direção', 'DIR-TERM-01', 88.00, 1),
('Bomba d''Água', 'ARF-BOMB-01', 195.00, 1),
('Válvula Termostática', 'ARF-VALV-02', 110.00, 1),
('Aditivo para Radiador Pronto Uso (1L)', 'ARF-ADIT-1L', 29.90, 1),
('Lâmpada Farol H7 12V 55W', 'ELE-LAMP-H7', 28.00, 1),
('Palheta Limpador de Para-brisa (Par)', 'EXT-PALH-01', 75.00, 1);

-- =====================================================================
-- 2. CATÁLOGO DE SERVIÇOS / MÃO DE OBRA (tb_servico)
-- =====================================================================
INSERT INTO tb_servico (nome, descricao, preco_referencia, minutos_estimados, ativo) VALUES
('Troca de óleo e filtros', 'Substituição do óleo do motor, filtro de óleo, filtro de ar e combustível', 120.00, 45, 1),
('Revisão preventiva completa', 'Check-up de 40 itens, fluidos, freios, suspensão, elétrica e scanner', 350.00, 180, 1),
('Troca de pastilhas de freio', 'Substituição do jogo de pastilhas e limpeza do sistema de freio', 140.00, 60, 1),
('Troca de discos e pastilhas de freio', 'Substituição do par de discos e jogo de pastilhas com sangria', 220.00, 90, 1),
('Sangria e troca do fluido de freio', 'Substituição completa do fluido DOT 4 nas 4 rodas', 110.00, 45, 1),
('Alinhamento 3D e balanceamento', 'Alinhamento computadorizado de direção e balanceamento das 4 rodas', 150.00, 60, 1),
('Troca de kit correia dentada', 'Substituição da correia sincronizadora e rolamento tensor', 320.00, 180, 1),
('Troca de kit de embreagem', 'Remoção do câmbio e substituição do kit completo de embreagem', 550.00, 300, 1),
('Substituição de amortecedores dianteiros', 'Troca do par de amortecedores e kits de batente/coxim dianteiros', 280.00, 150, 1),
('Substituição de amortecedores traseiros', 'Troca do par de amortecedores traseiros', 180.00, 90, 1),
('Diagnóstico eletrônico com scanner', 'Leitura de falhas na injeção eletrônica, ABS e airbag via scanner OBD2', 130.00, 45, 1),
('Limpeza de bicos injetores e TBI', 'Limpeza por ultrassom dos bicos injetores e corpo de borboleta', 190.00, 90, 1),
('Troca de velas e cabos de ignição', 'Substituição do jogo de velas e cabos com teste de centelha', 100.00, 40, 1),
('Manutenção do sistema de arrefecimento', 'Limpeza do sistema, troca de aditivo e teste de estanqueidade', 160.00, 90, 1),
('Higienização do ar-condicionado', 'Aplicação de ozônio/sanitizante e troca do filtro de cabine', 95.00, 30, 1)
ON DUPLICATE KEY UPDATE
  descricao = VALUES(descricao),
  preco_referencia = VALUES(preco_referencia),
  minutos_estimados = VALUES(minutos_estimados),
  ativo = 1;
