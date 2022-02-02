truncate tokens cascade ;
truncate users cascade ;

insert into  users (id,username, password, admin) values (1,'admin','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', true);
insert into  users (id,username, password, admin) values (2,'user1','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (3,'user2','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (4,'user3','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (5,'user4','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (6,'user5','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (7,'user6','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (8,'user7','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (9,'user8','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);


truncate teams cascade ;

insert into teams (id, name, description) values (1,'team1','user1’s team');
insert into teams (id, name, description) values (2,'team2','user2’s team');
insert into teams (id, name, description) values (3,'team3','user3’s team');
insert into teams (id, name, description) values (4,'team4','user4’s team');
insert into teams (id, name, description) values (5,'team5','user5’s team');
insert into teams (id, name, description) values (6,'team6','user6’s team');
insert into teams (id, name, description) values (7,'team7','user7’s team');
insert into teams (id, name, description) values (8,'team8','user8’s team');

truncate teams_composition cascade ;

insert into teams_composition (user_id, team_id, role) values (2,1,1);
insert into teams_composition (user_id, team_id, role) values (3,2,1);
insert into teams_composition (user_id, team_id, role) values (4,3,1);
insert into teams_composition (user_id, team_id, role) values (5,4,1);
insert into teams_composition (user_id, team_id, role) values (6,5,1);
insert into teams_composition (user_id, team_id, role) values (7,6,1);
insert into teams_composition (user_id, team_id, role) values (8,7,1);
insert into teams_composition (user_id, team_id, role) values (9,8,1);

truncate tournaments cascade ;

insert into tournaments (id, type, name, description, status, max_teams, game_name) values (1,2,'Test tournament', 'demo tournament', 0,8,'test game');

truncate tournaments_organizers cascade ;

insert into tournaments_organizers (tournament_id, user_id) VALUES (1,1);

truncate tournaments_participants cascade ;

insert into tournaments_participants (tournament_id,team_id, team_number) values (1,1,1);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,2,2);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,3,3);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,4,4);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,5,5);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,6,6);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,7,7);
insert into tournaments_participants (tournament_id,team_id, team_number) values (1,8,8);

truncate matches cascade ;
