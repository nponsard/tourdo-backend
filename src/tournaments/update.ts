import { Pool } from "https://deno.land/x/postgres@v0.14.3/pool.ts";
import {
    GetTournamentMatch,
    Match,
    MatchStatus,
    UpdateMatch,
} from "../database/entities/matches.ts";
import { GetTournament, TournamentType } from "../database/entities/tournaments.ts";



/**
 * This function updates the upper match in a Single Elimination tournament.
 */
export async function UpdateTournamentMatches(pool: Pool, match: Match) {
    if (
        match.status != MatchStatus.Team1Won &&
        match.status != MatchStatus.Team2Won &&
        match.status != MatchStatus.Draw
    )
        return;

    const tournament = await GetTournament(pool, match.tournament_id);

    if (tournament.type != TournamentType.SimpleElimination) return;

    const nextRow = Math.floor(match.row / 2);
    const nextColumn = match.column + 1;

    const upperMatch = await GetTournamentMatch(pool, match.tournament_id, nextRow, nextColumn);

    let winnerId = match.team1_id;
    if (match.status == MatchStatus.Team2Won) winnerId = match.team2_id;

    if (upperMatch) {
        let team1_id = upperMatch.team1_id;
        let team2_id = upperMatch.team2_id;

        // the winner takes the position according to the row of the match

        if (match.row % 2 == 0) team1_id = winnerId;
        else team2_id = winnerId;

        if (match.team1_id)
            await UpdateMatch(
                pool,
                upperMatch.id,
                team1_id,
                team2_id,
                nextRow,
                nextColumn,
                match.tournament_id,
                upperMatch.status,
                upperMatch.date
            );
    }
}
