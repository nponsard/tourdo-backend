create table if not exists events_organizers
(
    event_id int not null
        constraint events_organizers_events_id_fk
            references events,
    user_id  int not null
        constraint events_organizers_users_id_fk
            references users,
    constraint events_organizers_pk
        primary key (event_id, user_id)
);