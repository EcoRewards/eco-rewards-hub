ALTER TABLE member
CHANGE default_transport_mode default_transport_mode VARCHAR(10);

ALTER TABLE member
DROP CONSTRAINT unique_smartcard;
