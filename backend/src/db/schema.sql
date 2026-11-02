-- LifeGraph V5 & V6 Dual-Layer Architecture Schema (PostgreSQL)

-- =========================================================================
-- LAYER 1: VĨNH CỬU (META PROGRESSION - PLAYER ACCOUNT)
-- Tuyệt đối KHÔNG BAO GIỜ reset bảng này qua các kiếp luân hồi
-- =========================================================================
CREATE TABLE IF NOT EXISTS player_accounts (
    id VARCHAR(100) PRIMARY KEY DEFAULT 'primary_player',
    total_karma INT NOT NULL DEFAULT 100,
    unlocked_perks JSONB NOT NULL DEFAULT '[]'::jsonb,
    reincarnation_count INT NOT NULL DEFAULT 1,
    lifetime_stats JSONB NOT NULL DEFAULT '{"total_years_lived": 0, "max_net_worth": 0, "total_deaths": 0}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =========================================================================
-- LAYER 2: PHÙ DU (LOCAL SESSION - CURRENT LIFE)
-- Quản lý nhân vật trong kiếp sống hiện hành
-- =========================================================================
CREATE TABLE IF NOT EXISTS characters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    player_account_id VARCHAR(100) REFERENCES player_accounts(id) DEFAULT 'primary_player',
    name VARCHAR(255) NOT NULL,
    age INT NOT NULL DEFAULT 0,
    generation INT NOT NULL DEFAULT 1,
    parent_name VARCHAR(255),
    nationality VARCHAR(100) NOT NULL DEFAULT 'T2_Vietnam',
    background VARCHAR(255) NOT NULL DEFAULT 'Gia đình trung lưu',
    background_type VARCHAR(50) NOT NULL DEFAULT 'middle_class',
    innate_traits JSONB NOT NULL DEFAULT '[]'::jsonb,
    personality_flags JSONB NOT NULL DEFAULT '[]'::jsonb, -- 'cynical', 'empathetic', 'stoic', 'rebellious', 'pragmatic'
    vitality INT NOT NULL DEFAULT 100 CHECK (vitality >= 0 AND vitality <= 100),
    max_vitality INT NOT NULL DEFAULT 100,
    transhuman_frozen_until_age INT DEFAULT NULL, -- Khóa suy giảm Max Vitality
    is_transhuman BOOLEAN NOT NULL DEFAULT false,
    cash BIGINT NOT NULL DEFAULT 0, -- Khóa ở 0 cho đến 18 tuổi
    family_endowment BIGINT NOT NULL DEFAULT 0,
    burnout INT NOT NULL DEFAULT 0 CHECK (burnout >= 0 AND burnout <= 100),
    karma INT NOT NULL DEFAULT 100,
    action_points INT NOT NULL DEFAULT 3,
    hidden_flags JSONB NOT NULL DEFAULT '[]'::jsonb,
    delayed_flags JSONB NOT NULL DEFAULT '[]'::jsonb, -- trigger_at_age
    recent_event_tags JSONB NOT NULL DEFAULT '[]'::jsonb,
    experienced_scenarios JSONB NOT NULL DEFAULT '[]'::jsonb,
    history_log JSONB NOT NULL DEFAULT '[]'::jsonb,
    timeline_snapshots JSONB NOT NULL DEFAULT '[]'::jsonb, -- Phục vụ Video Death Recap 15s
    global_indices JSONB NOT NULL DEFAULT '{"economy": 65, "social": 65, "environment": 65}'::jsonb,
    current_portrait_url TEXT,
    is_deceased BOOLEAN NOT NULL DEFAULT false,
    death_cause TEXT,
    death_age INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. NPCs & Memory Table (Deep Narrative Arcs)
CREATE TABLE IF NOT EXISTS npcs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL, -- 'Tình đầu', 'Sếp cũ', 'Kẻ thù', 'Người mang ơn', 'Bạn tri kỷ', 'Con gái'
    status VARCHAR(50) NOT NULL DEFAULT 'alive', -- 'alive', 'deceased', 'missing'
    affinity INT NOT NULL DEFAULT 50 CHECK (affinity >= -100 AND affinity <= 100),
    memory_notes TEXT,
    last_encountered_age INT,
    avatar_color VARCHAR(50) DEFAULT '#6366f1',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'real_estate', 'stock', 'crypto', 'business'
    name VARCHAR(255) NOT NULL,
    current_value BIGINT NOT NULL DEFAULT 0,
    liquidity_status VARCHAR(50) NOT NULL DEFAULT 'liquid',
    maintenance_cost_per_tick INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Relationships Table (Family & Romance)
CREATE TABLE IF NOT EXISTS relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'child', 'spouse', 'partner', 'parent'
    name VARCHAR(255) NOT NULL,
    affection_level INT NOT NULL DEFAULT 70 CHECK (affection_level >= 0 AND affection_level <= 100),
    monthly_cost INT NOT NULL DEFAULT 0,
    inherited_traits JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Shadow DB Cache Table (Tick Events)
CREATE TABLE IF NOT EXISTS tick_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    character_id UUID REFERENCES characters(id) ON DELETE CASCADE,
    tick_number INT NOT NULL,
    event_data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
