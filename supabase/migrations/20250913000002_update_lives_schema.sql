-- Update lives table to match application expectations
-- Add title field and rename name to title, add description field

-- Add description column to lives table
ALTER TABLE lives ADD COLUMN description TEXT;

-- Add title column temporarily
ALTER TABLE lives ADD COLUMN title VARCHAR(255);

-- Copy data from name to title
UPDATE lives SET title = name;

-- Make title NOT NULL
ALTER TABLE lives ALTER COLUMN title SET NOT NULL;

-- Drop the old name column
ALTER TABLE lives DROP COLUMN name;

-- Update indexes
DROP INDEX IF EXISTS idx_lives_band_id;
DROP INDEX IF EXISTS idx_lives_date;
DROP INDEX IF EXISTS idx_lives_share_slug;

CREATE INDEX idx_lives_band_id ON lives(band_id);
CREATE INDEX idx_lives_date ON lives(date);
CREATE INDEX idx_lives_share_slug ON lives(share_slug) WHERE share_slug IS NOT NULL;
CREATE INDEX idx_lives_title ON lives USING GIN (to_tsvector('english', title));