/* RENAME location.type location.defaultJourneyType */
ALTER TABLE location CHANGE COLUMN type defaultJourneyType ENUM('journey', 'leisure') NOT NULL DEFAULT 'journey';
