create or replace function tournament_organizer_check()
    returns trigger
    language plpgsql
as
$$
declare
    count  int;
begin

    select count('any')
    into count
    from users
    where
          -- this user
          id = new.user_id
      and
          -- that is already a member of a team participating in the same tournament
          id in (select user_id
                  from teams_composition
                  where teams_composition.team_id in
                        (select team_id from tournaments_participants where tournament_id = new.tournament_id))
          ;
    if count > 0 then
        raise 'user % can’t join, he is already in the tournament', new.user_id;
    end if;
end
$$;

begin;
drop trigger if exists tournament_organizer_trigger on tournaments_organizers;
create trigger tournament_organizer_trigger
    before insert
    on tournaments_organizers
    for each row
execute procedure tournament_organizer_check();
end;