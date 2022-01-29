create table if not exists teams_composition
(
    user_id int not null
        constraint teams_composition_users_id_fk
            references users on delete cascade,
    team_id int not null
        constraint teams_composition_teams_id_fk
            references teams on delete cascade,
    role    int,
    constraint team_composition_pk
        primary key (user_id, team_id)
);