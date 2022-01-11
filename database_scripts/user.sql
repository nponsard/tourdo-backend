create table "user"
(
    id       serial
        constraint user_pk
            primary key,
    username varchar(50) not null,
    password text,
);

create unique index user_id_uindex
    on "user" (id);

create unique index user_username_uindex
    on "user" (username);