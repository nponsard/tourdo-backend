create table if not exists tokens
(
    access_hash text not null
        constraint tokens_pk
            primary key,
    user_id     int  not null
        constraint tokens_users_id_fk
            references users
);

create unique index if not exists tokens_access_hash_uindex
    on tokens (access_hash);

