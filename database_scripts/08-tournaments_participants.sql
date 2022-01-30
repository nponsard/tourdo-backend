create table if not exists tournaments_participants
(
    team_id       int not null
    references teams  on delete cascade,
    tournament_id serial not null
    references  tournaments  on delete cascade,
    team_number   serial,
        constraint tournaments_participants_pk
        primary key (team_id, tournament_id)
);

create unique index if not exists tournaments_participants_team_id_tournament_id_unique_index
    on tournaments_participants (team_id, tournament_id);
