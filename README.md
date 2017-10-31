# Movies Database 
## What we will learn
- Project and CLI setup
- Schema migration
- Seeding data

## 1 Project and CLI setup
1. Start by `npm init`
2. Install packages `npm install --save knex sqlite3 pg bluebird prettyjson`
3. For using knex CLI (command line interface) we need to install it globally `npm install -g knex`
4. `knex` in terminal you will see output similar to below
```
 init [options]                         Create a fresh knexfile.
    migrate:make [options] <name>          Create a named migration file.
    migrate:latest                         Run all migrations that have not yet been run.
    migrate:rollback                       Rollback the last set of migrations performed.
    migrate:currentVersion                 View the current version for the migration.
    seed:make [options] <name>             Create a named seed file.
    seed:run                               Run seed files.
 ```
 this shows the options available in knex. It has three major components 

    1. `init` for creating a configuration
    2. `migrate` for performing database migrations
    3. `seed` for populating tables with initial data

5. `knex init` it will create a file ./knexconfig.js it is similar to the knex config file in previous demo
6. Change file according to your settings. The code of modified file is given below
```
// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: { filename: './movie.sqlite' },
    migrations:{tableName: 'knex_migrations'},
    seed: { directory: './seeds'},
    debug:false
  },

  staging: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user:     'kamalpandey',
      database: 'movie_staging',
      password: ''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    },
    seed:{directory:'./seed'}
  },

  production: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user:'kamalpandey',
      database:'movie',
      password:''
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {tableName: 'knex_migrations'},
    seed:{directory: './seed'}
  },
  debug:false

};
```
7. For knex to perform migrations we need to create our database first, to create your movie database 
First get into the postsql CLI by typing `psql postgres -U username`. Note to change username according to user like i have user of kamalpandey the command becomes `psql postgres -U kamalpandey`. Then in type `CREATE DATABASE movie;` this will create a database. To view all present databases type in terminal `\list`.

Now our database and config files are ready let's start with **migrations**

