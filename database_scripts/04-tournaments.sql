create table if not exists tournaments
(
    id          serial
        constraint tournaments_pk
            primary key,
    type        int,
    name        text,
    date_start  date,
    date_end    date,
    description text,
    status      int,
);

create unique index if not exists tournaments_id_uindex
    on tournaments (id);
