-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create bands table
CREATE TABLE bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create songs table
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    artist VARCHAR(255) NOT NULL,
    youtube_url TEXT,
    spotify_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lives table
CREATE TABLE lives (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    venue VARCHAR(255) NOT NULL,
    ticket_url TEXT,
    is_upcoming BOOLEAN DEFAULT TRUE,
    share_slug VARCHAR(100) UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create setlist_items table
CREATE TABLE setlist_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    live_id UUID NOT NULL REFERENCES lives(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(live_id, order_index)
);

-- Create indexes for better performance
CREATE INDEX idx_bands_user_id ON bands(user_id);
CREATE INDEX idx_songs_band_id ON songs(band_id);
CREATE INDEX idx_songs_title_artist ON songs USING GIN (to_tsvector('english', title || ' ' || artist));
CREATE INDEX idx_lives_band_id ON lives(band_id);
CREATE INDEX idx_lives_date ON lives(date);
CREATE INDEX idx_lives_share_slug ON lives(share_slug) WHERE share_slug IS NOT NULL;
CREATE INDEX idx_setlist_items_live_id ON setlist_items(live_id);
CREATE INDEX idx_setlist_items_song_id ON setlist_items(song_id);
CREATE INDEX idx_setlist_items_order ON setlist_items(live_id, order_index);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON bands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lives_updated_at BEFORE UPDATE ON lives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique share slug
CREATE OR REPLACE FUNCTION generate_share_slug()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := '';
    i INTEGER := 0;
    slug_exists BOOLEAN := TRUE;
BEGIN
    WHILE slug_exists LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;

        SELECT EXISTS(SELECT 1 FROM lives WHERE share_slug = result) INTO slug_exists;
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Row Level Security (RLS) policies
ALTER TABLE bands ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE lives ENABLE ROW LEVEL SECURITY;
ALTER TABLE setlist_items ENABLE ROW LEVEL SECURITY;

-- Bands policies
CREATE POLICY "Users can view their own bands" ON bands
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bands" ON bands
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bands" ON bands
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bands" ON bands
    FOR DELETE USING (auth.uid() = user_id);

-- Songs policies
CREATE POLICY "Users can view songs from their bands" ON songs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = songs.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert songs to their bands" ON songs
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = songs.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update songs from their bands" ON songs
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = songs.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete songs from their bands" ON songs
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = songs.band_id
            AND bands.user_id = auth.uid()
        )
    );

-- Lives policies
CREATE POLICY "Users can view lives from their bands" ON lives
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = lives.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view shared lives" ON lives
    FOR SELECT USING (share_slug IS NOT NULL);

CREATE POLICY "Users can insert lives to their bands" ON lives
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = lives.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update lives from their bands" ON lives
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = lives.band_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete lives from their bands" ON lives
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM bands
            WHERE bands.id = lives.band_id
            AND bands.user_id = auth.uid()
        )
    );

-- Setlist items policies
CREATE POLICY "Users can view setlist items from their bands" ON setlist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lives
            JOIN bands ON lives.band_id = bands.id
            WHERE lives.id = setlist_items.live_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Public can view shared setlist items" ON setlist_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM lives
            WHERE lives.id = setlist_items.live_id
            AND lives.share_slug IS NOT NULL
        )
    );

CREATE POLICY "Users can insert setlist items to their lives" ON setlist_items
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM lives
            JOIN bands ON lives.band_id = bands.id
            WHERE lives.id = setlist_items.live_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update setlist items from their lives" ON setlist_items
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM lives
            JOIN bands ON lives.band_id = bands.id
            WHERE lives.id = setlist_items.live_id
            AND bands.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete setlist items from their lives" ON setlist_items
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM lives
            JOIN bands ON lives.band_id = bands.id
            WHERE lives.id = setlist_items.live_id
            AND bands.user_id = auth.uid()
        )
    );

-- Insert seed data for development
INSERT INTO bands (id, user_id, name, description) VALUES
('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440001', 'サンプルバンド', 'これはテスト用のバンドです');

INSERT INTO songs (id, band_id, title, artist, youtube_url, spotify_url) VALUES
('550e8400-e29b-41d4-a716-446655440010', '550e8400-e29b-41d4-a716-446655440000', 'サンプル楽曲 1', 'サンプルアーティスト', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://open.spotify.com/track/4uLU6hMCjMI75M1A2tKUQC'),
('550e8400-e29b-41d4-a716-446655440011', '550e8400-e29b-41d4-a716-446655440000', 'サンプル楽曲 2', 'サンプルアーティスト 2', NULL, NULL);

INSERT INTO lives (id, band_id, name, date, venue, is_upcoming, share_slug) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440000', 'テストライブ', '2024-12-31', 'サンプル会場', TRUE, 'testlive'),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440000', 'ARUMONA 2025', '2025-12-25', '渋谷クラブ', TRUE, 'arumona-2025');

INSERT INTO setlist_items (live_id, song_id, order_index) VALUES
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440010', 1),
('550e8400-e29b-41d4-a716-446655440020', '550e8400-e29b-41d4-a716-446655440011', 2),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440010', 1),
('550e8400-e29b-41d4-a716-446655440021', '550e8400-e29b-41d4-a716-446655440011', 2);