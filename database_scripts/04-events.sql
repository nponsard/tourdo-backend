create table if not exists events
(
    id          int
        constraint events_pk
            primary key,
    name        text,
    description text
);