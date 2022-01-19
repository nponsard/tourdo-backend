create table if not exists teams
(
    id          serial
        constraint teams_pk
            primary key,
    name        varchar(50),
    description text,
    match_count int default 0,
    win_count   int default 0
);

create unique index if not exists teams_id_uindex
    on teams (id);

