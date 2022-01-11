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
    event_id    int
        constraint tournaments_events_id_fk
            references events
);

create unique index if not exists tournaments_id_uindex
    on tournaments (id);
