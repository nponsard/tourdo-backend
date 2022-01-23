create or replace function tournament_participants_check()
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
          -- all users in the team
          id in (select user_id from teams_composition where teams_composition.team_id = new.team_id)
      and (
          -- that is already an organizer of the tournament
          id in
           (select user_id from tournaments_organizers where tournaments_organizers.tournament_id = new.tournament_id)
        or
          -- that is already a member of a team participating in the same tournament
          id in (select user_id
                  from teams_composition
                  where teams_composition.team_id in
                        (select team_id from tournaments_participants where tournament_id = new.tournament_id))
          );
    if count > 0 then
        raise 'team % can’t join, % members are already in the tournament', new.team_id, count;
    end if;
end
$$;

begin;
drop trigger if exists tournament_participants_trigger on tournaments_participants;
create trigger tournament_participants_trigger
    before insert
    on tournaments_participants
    for each row
execute procedure tournament_participants_check();
end;