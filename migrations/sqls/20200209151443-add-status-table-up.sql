
CREATE TABLE device_status (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  device_id varchar(50) NOT NULL,
  received DATE NOT NULL,
  status varchar(50) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

