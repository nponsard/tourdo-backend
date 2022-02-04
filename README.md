# woa-back-deno

Backend for the TourDO app, written in TypeScript for the Deno runtime.

## Deployment

Needs to be linked to a postgreSQL database.  
The server will listen on port 3000.

## starting 
Run 
```bash
deno run --allow-env --allow-net --allow-read ./src/index.ts
```
The server will listen to port 3000. \
You can also use the docker-compose.yml file while developing.

## Environment variables

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
-   DB_POOL_SIZE : number of connexions allowed in parallel to the db, 100 by default.


## api

The bodies sent to and recieved from the api is using snake_case naming to keep compatiblity with the database


## sample data passowrd (all users) :

```
82CFEkUXq3mY5i4
```

## improvements :
- trigger : can’t add beyond max_teams teams on tournaments 
-   comments
-   clean unused code


### procedures

-   `match_count_trigger` : Update total of matches played after the match ends

-   `tournament_participants_check` and `tournament_organizer_check` : A user can’t be on 2 teams participating at the same Tournament / event and can’t be player and organizer of a Tournament / event



## Tournament storage logic

### Single Elimination

```
1----\
      (1 vs 2)------\
2----/               \
                     (w12 vs w34)
3----\               /
      (3 vs 4)------/
4----/
```

Column, Row

match 1 vs 2 :\
column 0 row 0\
match winner of 1vs2 vs winner of 3vs4 :\
column 1 row 0


## User types

-   Admin
-   Tournament / event organizer
-   Player

