create table if not exists tournaments_organizers
(
    tournament_id int not null
        constraint tournaments_organizers_tournament_id_fk
            references tournaments on delete cascade ,
    user_id  int not null
        constraint tournaments_organizers_user_id_fk
            references users on delete cascade ,
    constraint tournaments_organizers_pk
        primary key (tournament_id, user_id)
);