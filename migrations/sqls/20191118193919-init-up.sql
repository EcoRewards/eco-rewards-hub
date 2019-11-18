
CREATE TABLE scheme (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY scheme_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE organisation (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  scheme_id int(11) unsigned NOT NULL,
  oauth_secret CHAR(86) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY organisation_name_and_scheme (scheme_id, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member (
  id int(11) unsigned NOT NULL,
  scheme_id int(11) unsigned NOT NULL,
  rewards int(11) unsigned NOT NULL,
  PRIMARY KEY (id, scheme_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reward_audit (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  organisation_id int(11) unsigned NULL,
  admin_user_id int(11) unsigned NULL,
  scheme_id int(11) unsigned NOT NULL,
  created DATETIME NOT NULL,
  filename VARCHAR(255) NULL,
  description VARCHAR(255) NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE api_token (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  organisation_id int(11) unsigned NOT NULL,
  created DATETIME NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_user (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  password binary(60) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_user_token (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  admin_user_id int(11) unsigned NOT NULL,
  created DATETIME NOT NULL,
  expires DATETIME NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

