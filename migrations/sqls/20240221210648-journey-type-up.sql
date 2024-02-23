
ALTER TABLE journey ADD COLUMN type ENUM('journey', 'leisure') NOT NULL DEFAULT 'journey';
ALTER TABLE location ADD COLUMN type ENUM('journey', 'leisure') NOT NULL DEFAULT 'journey';
