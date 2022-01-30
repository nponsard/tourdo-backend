create or replace function match_total_trigger()
    returns trigger
    language plpgsql
as
$$
declare
    team1_wins  int;
    team1_total int;
    team2_wins  int;
    team2_total int;
    mode        int;
    t1_id       int;
    t2_id       int;
begin

    mode = 1;
    if tg_op = 'DELETE' then
        -- return if one of the teams is undefined
        if (new.team1_id is null) or (new.team2_id is null) then
            return new;
        end if;

        mode = -1;
        t1_id = old.team1_id;
        t2_id = old.team2_id;
    else
        -- return if one of the teams is undefined
        if (new.team1_id is null) or (new.team2_id is null) then
            return new;
        end if;
        t1_id = new.team1_id;
        t2_id = new.team2_id;
    end if;

    select match_count, win_count
    from teams
    where team1_id = t1_id
    into team1_total,team1_wins;

    select match_count, win_count
    from teams
    where team2_id = t2_id
    into team2_total,team2_wins;

    if new.status = 1 then -- team 1 won
        team1_wins = team1_wins + mode;
    end if;
    if new.status = 2 then -- team 2 won
        team2_wins = team2_wins + mode;
    end if;

    if new.status >= 1 and new.status <= 3 then -- if a team won or it’s a draw
        team1_total = team1_total + mode;
        team2_total = team2_total + mode;

        update teams set win_count = team1_wins, match_count = team1_total where id = t1_id;
        update teams set win_count = team2_wins, match_count = team2_total where id = t2_id;
    end if;


end
$$;

begin;
drop trigger if exists match_count_trigger on matches;
create trigger match_count_trigger
    after update or insert or delete
    on matches
    for each row
execute procedure match_total_trigger();

end;