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
('Palheta Limpador de Para-brisa (Par)', 'EXT-PALH-01', 75.00, 1)
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  preco_referencia = VALUES(preco_referencia),
  ativo = 1;

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

-- =====================================================================
-- 3. CLIENTES DE TESTE (tb_cliente)
-- Endereços reais de São Paulo com CEP válido no padrão ViaCEP + nº + CEP
-- =====================================================================
INSERT INTO tb_cliente (nome, telefone, cpf_cnpj, email, endereco, ativo, criado_em, modificado_em) VALUES
('Ana Paula Martins', '(11) 98765-1101', '123.456.789-01', 'ana.martins@email.com', 'Avenida Paulista, Bela Vista - São Paulo/SP, nº 1578 - CEP 01310-200', 1, NOW(), NOW()),
('Carlos Eduardo Oliveira', '(11) 98765-2202', '234.567.890-12', 'carlos.oliveira@email.com', 'Rua Vergueiro, Vila Mariana - São Paulo/SP, nº 2450 - CEP 04102-000', 1, NOW(), NOW()),
('Juliana Ferreira Costa', '(11) 98765-3303', '345.678.901-23', 'juliana.costa@email.com', 'Rua Augusta, Consolação - São Paulo/SP, nº 1240 - CEP 01304-001', 1, NOW(), NOW()),
('Pedro Henrique Santos', '(11) 98765-4404', '456.789.012-34', 'pedro.santos@email.com', 'Rua Laguna, Jardim Caravelas - São Paulo/SP, nº 980 - CEP 04728-001', 1, NOW(), NOW()),
('Marina Duarte Almeida', '(11) 98765-5505', '567.890.123-45', 'marina.duarte@email.com', 'Avenida Brigadeiro Faria Lima, Itaim Bibi - São Paulo/SP, nº 3477 - CEP 04538-133', 1, NOW(), NOW()),
('Rafael Mendes Nogueira', '(11) 98765-6606', '678.901.234-56', 'rafael.mendes@email.com', 'Rua Haddock Lobo, Cerqueira César - São Paulo/SP, nº 595 - CEP 01414-001', 1, NOW(), NOW()),
('Luciana Prado Ribeiro', '(11) 98765-7707', '789.012.345-67', 'luciana.prado@email.com', 'Avenida Ibirapuera, Moema - São Paulo/SP, nº 2332 - CEP 04028-002', 1, NOW(), NOW()),
('Bruno Teixeira Lima', '(11) 98765-8808', '890.123.456-78', 'bruno.teixeira@email.com', 'Rua Turiassu, Perdizes - São Paulo/SP, nº 1105 - CEP 05005-001', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE
  nome = VALUES(nome),
  telefone = VALUES(telefone),
  email = VALUES(email),
  endereco = VALUES(endereco),
  ativo = 1,
  modificado_em = NOW();

-- =====================================================================
-- 4. VEÍCULOS DOS CLIENTES (tb_veiculo)
-- Vinculados dinamicamente pelo CPF único do cliente (FK cliente_id)
-- =====================================================================
INSERT INTO tb_veiculo (cliente_id, placa, marca, modelo, ano, cor, ativo, criado_em) VALUES
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '123.456.789-01'), 'FGH-2J34', 'Honda', 'Civic EXL 2.0', 2021, 'Prata', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '123.456.789-01'), 'FGH-9K12', 'Honda', 'HR-V Touring', 2023, 'Branco', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '234.567.890-12'), 'ABC-1D23', 'Volkswagen', 'Gol 1.6 MSI', 2020, 'Branco', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '345.678.901-23'), 'DEF-4G56', 'Hyundai', 'HB20 Comfort 1.0', 2022, 'Cinza', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '456.789.012-34'), 'JKL-7M89', 'Fiat', 'Argo Drive 1.3', 2021, 'Vermelho', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '567.890.123-45'), 'MNO-1P23', 'Toyota', 'Corolla XEi 2.0', 2023, 'Preto', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '678.901.234-56'), 'QRS-4T56', 'Chevrolet', 'Onix Plus LTZ', 2022, 'Azul', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '678.901.234-56'), 'QRS-8V10', 'Chevrolet', 'Tracker Premier', 2024, 'Cinza', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '789.012.345-67'), 'UVW-7X89', 'Renault', 'Kwid Zen 1.0', 2021, 'Branco', 1, NOW()),
((SELECT id FROM tb_cliente WHERE cpf_cnpj = '890.123.456-78'), 'XYZ-2A34', 'Jeep', 'Renegade Longitude', 2022, 'Grafite', 1, NOW())
ON DUPLICATE KEY UPDATE
  marca = VALUES(marca),
  modelo = VALUES(modelo),
  ano = VALUES(ano),
  cor = VALUES(cor),
  ativo = 1;
