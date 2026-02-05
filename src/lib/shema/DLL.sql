CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE SEQUENCE recurring_payments_sequence
    START 1
    INCREMENT 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


CREATE TABLE recurring_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sequence_id BIGINT NOT NULL DEFAULT nextval('recurring_payments_sequence'),
    user_id UUID NOT NULL,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(150),
    icon VARCHAR(10),
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    frequency VARCHAR(20) NOT NULL, -- monthly, weekly, yearly
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT recurring_payments_sequence_unique UNIQUE (sequence_id)
);






INSERT INTO recurring_payments (
    user_id,
    name,
    provider,
    icon,
    amount,
    currency,
    frequency,
    start_date,
    status
) VALUES
-- Servicios públicos
('Gas natural', 'Gas Natural Fenosa', '🔥', 85000, 'COP', 'monthly', '2026-02-01', 'active'),
('Energía eléctrica', 'Enel', '💡', 120000, 'COP', 'monthly', '2026-02-03', 'active'),
('Agua', 'Acueducto', '🚿', 65000, 'COP', 'monthly', '2026-02-05', 'active'),
('Internet hogar', 'Claro', '🌐', 110000, 'COP', 'monthly', '2026-02-07', 'active'),

-- Streaming
('Netflix', 'Netflix', '🎬', 38900, 'COP', 'monthly', '2026-02-10', 'active'),
('Spotify', 'Spotify', '🎵', 19900, 'COP', 'monthly', '2026-02-11', 'active'),
('Disney+', 'Disney', '🧸', 45900, 'COP', 'monthly', '2026-02-12', 'active'),
('Prime Video', 'Amazon', '📦', 24900, 'COP', 'monthly', '2026-02-13', 'active'),

-- Finanzas
('Tarjeta crédito Visa', 'Bancolombia', '💳', 350000, 'COP', 'monthly', '2026-02-15', 'active'),
('Crédito vehículo', 'Davivienda', '🚗', 980000, 'COP', 'monthly', '2026-02-18', 'active'),

-- Salud
('Seguro médico', 'SURA', '🏥', 210000, 'COP', 'monthly', '2026-02-20', 'active'),
('Plan dental', 'Colsanitas', '🦷', 45000, 'COP', 'monthly', '2026-02-21', 'active'),

-- Hogar
('Administración', 'Conjunto Residencial', '🏢', 180000, 'COP', 'monthly', '2026-02-22', 'active'),
('Parqueadero', 'Conjunto Residencial', '🅿️', 90000, 'COP', 'monthly', '2026-02-23', 'active'),

-- Educación
('Curso online', 'Platzi', '🎓', 99000, 'COP', 'monthly', '2026-02-24', 'active'),
('Educación universitaria', 'Universidad', '📚', 1200000, 'COP', 'monthly', '2026-02-25', 'active'),

-- Otros
('Gimnasio', 'Smart Fit', '🏋️', 89000, 'COP', 'monthly', '2026-02-26', 'active'),
('Celular', 'Movistar', '📱', 75000, 'COP', 'monthly', '2026-02-27', 'active'),
('Almacenamiento nube', 'Google', '☁️', 8900, 'COP', 'monthly', '2026-02-28', 'active'),
('Dominio web', 'GoDaddy', '🌍', 120000, 'COP', 'yearly', '2026-01-01', 'active');
