alter table member add column total_miles float(5,2) DEFAULT 0;
update member set total_miles = (select sum(distance) from journey where member_id = member.id);
