
CREATE TABLE trophy (
  id INT NOT NULL AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  member_id INT(11) UNSIGNED NOT NULL,
  date_awarded DATETIME NOT NULL,
  member_group_id INT(11) UNSIGNED NOT NULL,
  rewards INT(11) UNSIGNED NOT NULL,
  carbon_savings FLOAT(8,2) NOT NULL,
  miles FLOAT(8,2) NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE trophy ADD UNIQUE INDEX (name, member_id);
