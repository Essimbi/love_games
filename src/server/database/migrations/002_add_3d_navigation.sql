-- Add map_id and 3D coordinate columns to treasure_hunts table
ALTER TABLE treasure_hunts ADD COLUMN map_id TEXT;
ALTER TABLE treasure_hunts ADD COLUMN treasure_x REAL;
ALTER TABLE treasure_hunts ADD COLUMN treasure_y REAL;
ALTER TABLE treasure_hunts ADD COLUMN treasure_z REAL;

-- Add 3D coordinate columns to treasure_steps table
ALTER TABLE treasure_steps ADD COLUMN pos_x REAL;
ALTER TABLE treasure_steps ADD COLUMN pos_y REAL;
ALTER TABLE treasure_steps ADD COLUMN pos_z REAL;

-- Create indexes for the new columns
CREATE INDEX IF NOT EXISTS idx_treasure_hunts_map_id ON treasure_hunts(map_id);
