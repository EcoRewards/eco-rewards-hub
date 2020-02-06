ALTER TABLE scheme ADD COLUMN vac_client_id INT(11) unsigned NOT NULL;
UPDATE scheme SET vac_client_id = 155;
