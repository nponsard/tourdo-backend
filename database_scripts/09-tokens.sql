create table if not exists tokens
(
    id serial
        constraint tokens_pk
            primary key,
    user_id     int  not null
        constraint tokens_users_id_fk
            references users,
    token       text not null,
    expiration date not null,
    refresh_token text not null,
    refresh_token_expiration date not null
);

