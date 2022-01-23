import { Team } from "../database/entities/team.ts";

export function ShuffleTournamentTeams(
    teams: { team: Team }[]
): { team_id: number; team_number: number }[] {
    const remainingNumbers = [];

    for (let i = 0; i < teams.length; i++) {
        remainingNumbers.push(i);
    }

    const shuffled_teams = [];

    for (const team of teams) {
        const index = Math.floor(Math.random() * remainingNumbers.length);
        const team_number = remainingNumbers[index];
        shuffled_teams.push({ team_id: team.team.id, team_number: team_number });
        remainingNumbers.splice(index, 1);
    }

    return shuffled_teams;
}
