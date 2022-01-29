create table if not exists matches
(
    id            serial
        constraint matches_pk
            primary key,
    team1_id      int  null
        constraint matches_team1__fk
            references teams  on delete cascade,
    team2_id      int  null
        constraint matches_team2__fk
            references teams  on delete cascade,
    row           int default null,
    "column"      int default null,
    tournament_id integer not null
        constraint matches_tournament_id_fk
            references tournaments  on delete cascade,
    status     int,
    date          timestamp,
    unique(tournament_id, row, "column")
);

create unique index if not exists matches_id_uindex
    on matches (id);

