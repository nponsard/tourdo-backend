create table if not exists tournaments
(
    id          serial
        constraint tournaments_pk
            primary key,
    type        int,
    name        text,
    description text,
    start_date  date default null,
    end_date    date default null,
    status      int  default 0,
    max_teams   int,
    game_name   text,
    UNIQUE (name)
);

create unique index if not exists tournaments_id_uindex
    on tournaments (id);

