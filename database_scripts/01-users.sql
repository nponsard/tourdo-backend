create table if not exists  "users"
(
    id       serial
        constraint user_pk
            primary key,
    username varchar(50) not null,
    password text,
    admin   boolean default false,
    UNIQUE(username)
);

create unique index if not exists user_id_uindex
    on "users" (id);

create unique index if not exists user_username_uindex
    on "users" (username);