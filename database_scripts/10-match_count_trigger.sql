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

    if tg_op = 'DELETE' then
        -- return if one of the teams is undefined
        if (old.team1_id is null) or (old.team2_id is null) then
            return new;
        end if;

        mode = -1;
        t1_id = old.team1_id;
        t2_id = old.team2_id;
    else
        -- return if one of the teams is undefined
        if new.team1_id is null or new.team2_id is null then
            return new;
        else
            t1_id = new.team1_id;
            t2_id = new.team2_id;
        end if;

    end if;

    if new.status >= 1 and new.status <= 3 then -- if a team won or it’s a draw

    -- recalculate match counts
        select COALESCE(count(distinct (id)), 0)
        into team1_total
        from matches
        where (team1_id = t1_id or team2_id = t1_id)
          and status > 0;
        select COALESCE(count(distinct (id)), 0)
        into team2_total
        from matches
        where (team1_id = t2_id or team2_id = t2_id)
          and status > 0;

        -- recalculate win counts
        select COALESCE(count(distinct (id)), 0)
        into team1_total
        from matches
        where (team1_id = t1_id and status = 1)
           or (team2_id = t1_id and status = 2);
        select COALESCE(count(distinct (id)), 0)
        into team2_total
        from matches
        where (team1_id = t2_id and status = 1)
           or (team2_id = t2_id and status = 2);

        update teams set win_count = team1_wins, match_count = team1_total where id = t1_id;
        update teams set win_count = team2_wins, match_count = team2_total where id = t2_id;
    end if;

    return new;
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