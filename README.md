# woa-back-deno

Backend for woa tournament app

## TODO :

-   implement api
    -   [x] users
        -   [x] SEARCH user
    -   [x] tokens
    -   [x] teams
        -   [x] POST /teams
        -   [x] GET /teams
        -   [x] GET /teams/{id}
        -   [x] PATCH /teams/{id}
        -   [x] DELETE /teams/{id}
        -   [x] GET /teams/{id}/users
        -   [x] PUT /teams/{id}/users
        -   [x] DELETE /teams/{id}/users/{userID}
    -   [ ] tournaments
        -   [ ] GET /tournaments
        -   [x] POST /tournaments
        -   [x] GET /tournaments/{id}
        -   [x] DELETE /tournaments/{id}
        -   [x] PATCH /tournaments/{id}
        -   [ ] BEGIN TOURNAMENT
    -   [x] matches
        -   [x] POST /matches
        -   [x] GET /matches/{id}
        -   [x] DELETE /matches/{id}
        -   [x] PATCH /matches/{id}
-   add procedures
-   add functionalities : 
    -  [x] add team to tournament (organizer only)
    -  [x] team can leave tournament (organizer)
    -  [ ] add other organizers to the tournament
    -  [x] start of the tournament : create matches / regenerate matches
    -  [x] edit team numbers on tournament (order of appearance)

## Deployment

Needs to be linked to a postgreSQL database.

### Environment variables

-   JWT_KEY : key to be used to sign JWT, use this command to generate a new key :
    ```bash
    deno run ./src/jwt/generate.ts
    ```
-   INIT_DB : initialize the database at start
-   DATABASE_URL : url of the postgresql database, used before the next variables
-   DB_HOST : hostname / ip of the DB
-   DB_PORT : port of the DB
-   DB_USERNAME : username to connect to the DB
-   DB_PASSWORD : password to connect to the DB
-   DB_DATABASE : name of the database to use

## technologies

-   Deno : pleasant api, native typescript support, - less libraries compared to
    node.js
-   Typescript : easier dev, type definition to write
-   Oak : easy routing
-
-
-

## Tournament storage

### Single Elimination

```
1----\
      (12)------\
2----/           \
                  (1234)
3----\           /
      (34)------/
4----/
```

Column, Row

match 1 vs 2 :\
column 1 row 1 match w12 vs w34 :\
column 2 row 1

### Round Robin

Column, Row

Where Column is the id of the first oponent and Row is the id of the second
opponent

## User types

-   Admin
-   Tournament / event organizer
-   Player

## Tables

[x] TOURNAMENTS_ORGANIZERS(#**EVENT_ID**, #**USER_ID**)\
[x] TOURNAMENTS(**ID**, TYPE, NAME, DATE_START, DATE_END, DESCRIPTION,
EVENT_NAME)\
[x] MATCHES(**ID**, #TEAM1_UID, #TEAM2_UID, ROW, COLUMN, #TOURNAMENT_UID, #DATE
)\
[x] TOURNAMENT_PARTICIPANT(#**TEAM_ID**, #**TOURNAMENT_ID**, TEAM_NUMBER)\
[x] USERS(**ID**, FIRSTNAME, LASTNAME, PASSWORD )\
[x] TEAMS_COMPOSITION(#**USER_ID**, #**TEAM_ID**, ROLE) [x] TEAMS(**ID**, NAME,
DESCRIPTION, MATCH_COUNT, WIN_COUNT)\
[x] TOKENS(**ACCESSHASH**, #USER_ID)

### procedures

A user can’t be on 2 teams participating at the same Tournament / event A user
can’t be player and organizer of a Tournament / event
