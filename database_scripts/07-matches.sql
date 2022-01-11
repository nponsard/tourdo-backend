create table matches
(
    id            serial
        constraint matches_pk
            primary key,
    team1_id      int not null
        constraint matches_team1__fk
            references teams,
    team2_id      int not null
        constraint matches_team2__fk
            references teams,
    row           int,
    "column"      int,
    tournament_id int,
    date          date
);

create unique index matches_id_uindex
    on matches (id);

