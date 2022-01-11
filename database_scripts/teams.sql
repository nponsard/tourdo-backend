create table teams
(
    id          serial
        constraint teams_pk
            primary key,
    name        varchar(50),
    description text,
    match_count int,
    win_count   int
);

create unique index teams_id_uindex
    on teams (id);

