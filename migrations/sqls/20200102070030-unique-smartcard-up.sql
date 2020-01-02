ALTER TABLE member
CHANGE default_transport_mode default_transport_mode VARCHAR(25);

ALTER TABLE member
ADD CONSTRAINT unique_smartcard UNIQUE (smartcard);
