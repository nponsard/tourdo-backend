create table "users"
(
    id       serial
        constraint user_pk
            primary key,
    username varchar(50) not null,
    password text
);

create unique index user_id_uindex
    on "users" (id);

create unique index user_username_uindex
    on "users" (username);