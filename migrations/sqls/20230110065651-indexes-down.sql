ALTER TABLE member DROP INDEX (member_group_id);
ALTER TABLE member_group DROP INDEX (organisation_id);
ALTER TABLE organisation DROP INDEX (scheme_id);
