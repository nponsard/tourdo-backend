id,truncate tokens;
truncate users;

insert into  users (id,username, password, admin) values (1,'admin','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', true);
insert into  users (id,username, password, admin) values (2,'user1','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (3,'user2','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (4,'user3','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);
insert into  users (id,username, password, admin) values (5,'user4','$2a$10$HWR6HocjushAop9hjO/iIOOBWWyoN/IsGpK0CxTmqzDEgINJt8Req', false);


truncate teams;

insert into teams (id, name, description) values (1,'team1','user1’s team');
insert into teams (id, name, description) values (2,'team2','user2’s team');
insert into teams (id, name, description) values (3,'team3','user3’s team');
insert into teams (id, name, description) values (4,'team4','user4’s team');

truncate teams_composition;

insert into teams_composition (user_id, team_id, role) values (2,1,1);
insert into teams_composition (user_id, team_id, role) values (3,2,1);
insert into teams_composition (user_id, team_id, role) values (4,3,1);
insert into teams_composition (user_id, team_id, role) values (5,4,1);

truncate tournaments;

insert into tournaments (id, type, name, description, status, max_teams, game_name) values (1,2,'Test tournament', 'demo tournament', 0,4,'test game');

truncate tournaments_organizers;

insert into tournaments_organizers (tournament_id, user_id) VALUES (1,1);

truncate tournaments_participants;

insert into tournaments_participants (team_id, team_number) values (1,1);
insert into tournaments_participants (team_id, team_number) values (2,2);
insert into tournaments_participants (team_id, team_number) values (3,3);
insert into tournaments_participants (team_id, team_number) values (4,4);

truncate matches;
