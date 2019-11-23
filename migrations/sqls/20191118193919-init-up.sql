
CREATE TABLE scheme (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY scheme_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE organisation (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  scheme_id int(11) unsigned NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member_group (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  organisation_id int(11) unsigned NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE member (
  id int(11) unsigned NOT NULL,
  member_group_id int(11) unsigned NOT NULL,
  rewards int(11) unsigned NOT NULL,
  carbon_saving int(11) unsigned NOT NULL,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE reward (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  admin_user_id int(11) unsigned NULL,
  uploaded datetime NOT NULL,
  processed datetime NOT NULL,
  travel_date datetime NOT NULL,
  member_id int(11) unsigned NULL,
  distance float(5,2) unsigned NOT NULL,
  mode varchar(10) NOT NULL,
  rewards_earned int(11) unsigned default 0,
  carbon_saving int(11) unsigned default 0,
  PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE admin_user (
  id int(11) unsigned NOT NULL AUTO_INCREMENT,
  name varchar(50) NOT NULL,
  email varchar(50) NOT NULL,
  password binary(60) NOT NULL,
  role enum('admin', 'provider'),
  PRIMARY KEY (id),
  UNIQUE KEY admin_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


