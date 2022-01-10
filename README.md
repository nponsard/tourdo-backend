# woa-back-deno

Backend

## technologies

- Deno : pleasant api, native typescript support, - less libraries compared to node.js
- Typescript : easier dev, type definition to write
- Oak : easy routing
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

match 1 vs 2 :  
 column 1 row 1
match w12 vs w34 :  
 column 2 row 1

### Round Robin

Column, Row

Where Column is the id of the first oponent and Row is the id of the second opponent

## User types

- Admin
- Tournament / event organizer
- Player

## Tables

EVENT(**ID**, NAME, DESCRIPTION)  
EVENT_ORGANIZER(#**EVENT_ID**, #**USER_ID**)  
TOURNAMENT(**ID**, TYPE, NAME, DATE, DESCRIPTION, #EVENT_ID)  
MATCHES(**ID**, #TEAM1_UID, #TEAM2_UID, ROW, COLUMN, #TOURNAMENT_UID, #DATE )  
TOURNAMENT_PARTICIPANT(#**TEAM_ID**, #**TOURNAMENT_ID**, TEAM_NUMBER)  
USER(**ID**, FIRSTNAME, LASTNAME, PASSWORD )  
TEAM_COMPOSITION(#**USER_ID**, #**TEAM_ID**, ROLE)
TEAM(**ID**, NAME, DESCRIPTION, MATCH_COUNT, WIN_COUNT)  
TOKEN(**ACCESSHASH**, #USER_ID)

### procedures

A user can’t be on 2 teams participating at the same Tournament / event
A user can’t be player and organizer of a Tournament / event
