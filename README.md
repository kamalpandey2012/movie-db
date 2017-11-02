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

## 2 Schema migrations 
Run command `knex migrate:make person` to create migrations for person table, knex will create a file in migrations folder with name 'somenumber_person.js'. This will contain `exports.up` function and `exports.down` function. Both functions contain two parameters one is knex instance other one is promise of bluebird library. The **up** function is for applying the migration and **down** function is for undoing the migration. Each should return a promise for the work being done.

When using the query builder we call functions on the knex instance but when using the schema builder we call function on the knex.schema object, note that each schema function will return a promise for its operation. Lets assume we want to craate a person table using the create table function, the first argument is the name of the table and the second argument is the callback function that we will use to create different columns of the table. The first column is the primary key that is id and it will be achieved by autoincrement function `tb.increments()` function, it will create column id by default we can also name column by passing it `tb.increments("id")`. The data type of this column will be an integer except for the postgres database which will use the serial datatype. If you wish to store large number of records you could use bigincrements method or big serial data type for postgres. Next column will be 'firstname' with maximum length of '30' characters `tbl.string('firstname', 30)`. By default the columns are 'nullable' we can define 'notNullable()' explicitly `tbl.string('firstname', 30).notNullable()`. You could also give default value to the column by `.defaultTo('n/a')`. Similarly create a 'lastname' field. Then we will add third field and will incorrectly name it junk with size 60 for something to correct in our next migration.

Now write the down function with undo of the up function. In up function we created a person table with some columns and undo of this thing is dropping the table. it could be achieved by `knex.schema.dropTable('person')` and if you want to be extra safe you could use `dropTableIfExist('person')`. That completes our first migration let's apply to our database. 

Ask connect to migrate to the latest migration by typing following command in terminal
```
knex migrate:latest
```

The complete code of the above steps 

```
exports.up = function(knex, Promise) {
    return knex.schema
    //person table
    .createTable('person', function(tbl){
        //autoincrement id
        tbl.increments();
        tbl.string('firstname', 30).notNullable().defaultTo('n/a');
        tbl.string('lastname', 30).notNullable().defaultTo('n/a');
        tbl.string('junk', 60).notNullable().defaultTo('n/a');
    })

};

exports.down = function(knex, Promise) {
    return knex.schema.dropTableIfExist('person');
};

```

To view effect of these migration use sqlite explorer program to view the tables or paste `sqlite3 movie.sqlite` in terminal, it will open sqlite with movie database loaded in sqlite. Now set some settings to view data properly 

1. `.headers on` this will show table headers when quering data from table
2. `.mode column` this will show data in column format or tabular format
3. `.tables` to view all tables in the db. After running this command in terminal it will show 3 tables ie. 'knex\_migrations', 'knex\_migrations\_lock' and 'person' table. Hence the table has been created. Now to view schema 
4. `.schema person` it will show the schema of the table that should match what we have created
5. now query knex_migrations table `SELECT * from knex_migrations;` this will give you your latest migration that you have created. 

To correct the junk column name.

1. We have to create a new migration that will be created by using `knex migrate:make person_name`. This will create a new file with this migration inside that in the up function 
2. Lets start by testing that table exist we will use the 'hasTable' function and specifying the table then a callback function which will be true if table exist and false if table don't exist. then check whether it exist, if exist then use the table function that will take the tablename as first argument and second a callback that we can use to change the schema. 
3. One way to change the table is to drop the column by using `tbl.dropColumn('junk)` and then recreating the column as there is no data to worry about.  But its probably simple to rename it.
4. `tbl.renameColumn('junk','name');` this will rename the 'junk' column to 'name' column. And in our down function we will undo the up function. To get table schema use `PRAGMA table_info(person);`
5. we will use `tbl.renameColumn('name', 'junk');` this will rename 'name' to 'junk' again. Now run the migration
6. `knex migrate:latest`
7. Now in the person table the junk column has been replaced to 'name' column and a new record will be added to migration file that ran as batch 2. Now ask the migration tool to rollback all migrations. 
8. `knex migrate:rollback;` this will rollback the 'person_name' migration, run rollback once more it will revert back to db without table 'person'
9. Now update back to the latest migration, you could see both migration files will run. Now check tables from db, we get our person table back with the correct name and both of our migration files are listed under batch 1. Now rollback this time both migrations will be rolled back, this shows rollback occur at the batch level not individual migration file level 

The complete code of file will be 

```
exports.up = function (knex, Promise) {
    return knex
        .schema
        .hasTable('person')
        .then(function (exist) {
            if (exist) {
                return knex
                    .schema
                    .table('person', function (tbl) {
                        tbl.renameColumn('junk', 'name');
                    });
            }
        });
};

exports.down = function (knex, Promise) {
    return knex
        .schema
        .table('person', function (tbl) {
            tbl.renameColumn('name', 'junk'); 
        });
};
```
Now let's create migration file for rest of our movie database.
`knex migrate:make movie_tables`

This will create a migration file inside that create different tables in the up function and drop them in the down function. 

**Rating** - This table Will also have auto incrementing primary key similar to person table then it will have a unique field which will be the name of the rating. Lets create it by this code `tbl.string('name', 5).notNullable().unique('uq_rating_name');` here we are taking its size to 5 and its a not nullable field with unique characterstic and name uq\_rating\_name. 

code 

```
return knex
        .schema
    //<rating table>
        .createTable('rating', function (tbl) {
            tbl.increments();
            tbl.string('name', 5).notNullable().unique('uq_rating_name');
});
```

**Movie**- Will contain same type of primary key and 2 foreign integer keys. First one is rating id and other one is director_id. lets define rating id key `tbl.integer('rating_id').notNullable().references('id').inTable('rating');` Here we are telling knex to create a integer field with name 'rating_id' which references to 'id' field of 'rating' table. Similarly create director_id field `tbl.integer('director_id').notNullable().references('id').inTable('person');`. 

After these two foreign key columns we have many general columns that are listed below in code 

```
tbl.string('title', 200).notNullable().defaultTo('');
tbl.string('overview', 999);
tbl.integer('releaseyr');
tbl.integer('score').notNullable().defaultTo(7);
tbl.integer('runtime').notNullable().defaultTo(90);
tbl.date('lastplaydt');

```

We need only certain types of data types but schema builder has many more such as **float, decimal, boolean, time, dateTime, binary, comment and more**. Instead of this large pool of data types your data type doesn't supported by the knex then you could specify custom type by `specificColumn(col,val)` and just like query builder, schema builder also has its own raw function in which you could write raw queries

**tag** - This table will be defined exactly like the rating table with auto incrementing 'id' and a unique field 'name'.

Now let's create many to many table between tags and movies this table will will be called 'tag_movie'

**tag\_movie** - The 2 columns in this table are both foreign keys and together they together make up table's primary key. First column will be 'tag_id' which will be defined as `tbl.integer('tag_id').notNullable().references('id').inTable('tag').onDelete('CASCADE');` this code will create a 'tag_id' field with reference of 'id' from table 'tag' and on delete of the parent key it will also be deleted this is meaning of "onDelete('cascade')". Similarly create 'movie_id' column `tbl.integer('movie_id').notNullable().references('id').inTable('movie').onDelete('CASCADE')`. Now define the primary key of this table that will consisit of both the above keys. `tbl.primary(['tag_id', 'movie_id'])`. 

**actor\_movie** - We can follow the same pattern of the above table. Create two foreign key 'person_id' and 'movie_id' than a primary key from these columns. 

Now in the down function just drop these five tables that we just created.

The complete code of the file is given below

```
exports.up = function (knex, Promise) {
    return knex
        .schema
    
    //<rating table>
        .createTable('rating', function (tbl) {
            tbl.increments();
            tbl.string('name', 5).notNullable().unique('uq_rating_name');
        })

        //<movie table>
        .createTable('movie', function (tbl) {
            tbl.increments();
          
            //foreign key integers
            tbl.integer('rating_id').notNullable().references('id').inTable('rating');
            tbl.integer('director_id').notNullable().references('id').inTable('person');
            // title(200),overview(999),releaseyr(), score(default=7), date.lastplaydt,
            // runtime(90 default)
            tbl.string('title', 200).notNullable().defaultTo('');
            tbl.string('overview', 999);
            tbl.integer('releaseyr');
            tbl.integer('score').notNullable().defaultTo(7);
            tbl.integer('runtime').notNullable().defaultTo(90);
            tbl.date('lastplaydt');
        })
        
        //<tag table>
        .createTable('tag', function (tbl) {
            tbl.increments();
            tbl.string('name', 30).notNullable().unique('uq_tag_name');
        })

        //<tag movie table>
        .createTable('tag_movie', function (tbl) {
            tbl.integer('tag_id').notNullable().references('id').inTable('tag').onDelete('CASCADE');
            tbl.integer('movie_id').notNullable().references('id').inTable('movie').onDelete('CASCADE');
            tbl.primary(['tag_id', 'movie_id']);
        })
   
        //<actor_movie table>
        .createTable('actor_movie', function (tbl) {
            tbl.integer('person_id').notNullable().references('id').inTable('person').onDelete('CASCADE');
           tbl.integer('movie_id').notNullable().references('id').inTable('movie').onDelete('CASCADE');
        });
};

exports.down = function (knex, Promise) {
    return knex
        .schema
        .dropTable('actor_movie')
        .dropTable('movie')
        .dropTable('tag')
        .dropTable('rating')
        .dropTable('tag_movie');
};

```

Now run the migration to the latest and then on the production environment by typing following command in terminal
```
knex migrate:latest --env production
```

Just by typing a single command we have created the complete database on our production environment. Isn't it great?

## 3 Seeding Data
When developing an application it's always very important to have some data. Knex has a CLI tool to seed the data using code separate from that of migrations. Similar to migrations ask the knex CLI to generate a seed file, unlike migrations file they don't run in order of their creation instead alphabetically so it's advisable to use numbering in their names. 

Lets create seed file for rating table

```
knex seed:make 01-rating
```
By executing this command in terminal it will create a seed file that will contain code to delete all the existing data and then inserting some data into the database. 

We will change the file to 

```
exports.seed = function(knex, Promise) {
  const tblName = "rating";
  const rows = [
    { name: "PG" }, //1
    { name: "G" }, //2
    { name: "PG-13" }, //3
    { name: "R" } //4
  ];

  return knex(tblName)
    .del() //delete existing data
    .then(function() {
      return knex.insert(rows).into(tblName); //Insert new rows
    });
};
```

We begin by creating a variable that will hold the name of the table we are seeding data into, then the data itself into the rows variable, then we are asking knex to delete the existing data and then populating it with new data. 

Now this process will be repeated to seed data into other 5 tables

Lets copy and paste code quickly to see the result 

**TAG** 

```
exports.seed = function(knex, Promise) 
{
  var tblName = 'tag';
  var rows =
  [
      {name: '3D'},             //1
      {name: 'Action'},         //2
      {name: 'Animation'},      //3
      {name: 'Comedy'},         //4
      {name: 'Crime'},          //5
      {name: 'Disaster'},       //6
      {name: 'Drama'},          //7
      {name: 'Family'},         //8
      {name: 'Fantasy'},        //9
      {name: 'Holiday'},        //10
      {name: 'Horror'},         //11
      {name: 'Martial Arts'},   //12
      {name: 'Musical'},        //13
      {name: 'Mystery'},        //14
      {name: 'Romance'},        //15
      {name: 'Sci-Fi'},         //16
      {name: 'Sports'},         //17
      {name: 'Suspense'},       //18
      {name: 'Thriller'},       //19
      {name: 'War'},            //20
      {name: 'Western'},        //21
  ];
          
  return knex(tblName)
              .del()                                        //Remove all rows from table
              .then(function()
              {
                  return knex.insert(rows).into(tblName);   //Insert new rows
              });
};
```

**person**

```
exports.seed = function(knex, Promise)
{
  var tblName = 'person';
  var rows =
  [ 
      { name: "Michael Bay",       firstname:"Michael",     lastname:"Bay"},       //1
      { name: "Sean Connery",      firstname:"Sean",        lastname:"Connery"},   //2
      { name: "Nicolas Cage",      firstname:"Nicolas",     lastname:"Cage"},      //3
      { name: "Ed Harris",         firstname:"Ed",          lastname:"Harris"},    //4
      { name: "Shawn Levy",        firstname:"Shawn",       lastname:"Levy"},      //5
      { name: "John Avildsen",     firstname:"John",        lastname:"Avildsen"},  //6
      { name: "Ben Stiller",       firstname:"Ben",         lastname:"Stiller"},   //7
      { name: "Carla Gugino",      firstname:"Carla",       lastname:"Gugino"},    //8
      { name: "Ricky Gervais",     firstname:"Ricky",       lastname:"Gervais"},   //9
      { name: "Robin Williams",    firstname:"Robin",       lastname:"Williams"},  //10
      { name: "Dick Van Dyke",     firstname:"Dick",        lastname:"Van Dyke"},  //11
      { name: "Owen Wilson",       firstname:"Owen",        lastname:"Wilson"},    //12
      { name: "Christopher Nolan", firstname:"Christopher", lastname:"Nolan"},     //13
      { name: "Christian Bale",    firstname:"Christian",   lastname:"Bale"},      //14
      { name: "Michael Caine",     firstname:"Michael",     lastname:"Caine"},     //15
      { name: "Ken Watanabe",      firstname:"Ken",         lastname:"Watanabe"},  //16
      { name: "Kevin Reynolds",    firstname:"Kevin",       lastname:"Reynolds"},  //17
      { name: "Jim Caviezel",      firstname:"Jim",         lastname:"Caviezel"},  //18     
      { name: "Guy Pearce",        firstname:"Guy",         lastname:"Pearce"},    //19     
      { name: "Richard Harris",    firstname:"Richard",     lastname:"Harris"},    //20     
      { name: "Dagmara Dominczyk", firstname:"Dagmara",     lastname:"Dominczyk"}, //21    
      { name: "Luis Guzm�n",       firstname:"Luis",        lastname:"Guzm�n"},    //22     
      { name: "Michael Wincott",   firstname:"Michael",     lastname:"Wincott"},   //23     
      { name: "George Cosmatos",   firstname:"George",      lastname:"Cosmatos"},  //24
      { name: "Kurt Russell",      firstname:"Kurt",        lastname:"Russell"},   //25
      { name: "Val Kilmer",        firstname:"Val",         lastname:"Kilmer"},    //26 
      { name: "Sam Elliott",       firstname:"Sam",         lastname:"Elliott"},   //27 
      { name: "Terry O''Quinn",    firstname:"Terry",       lastname:"O''Quinn"},  //28 
      { name: "Andrew Davis",      firstname:"Andrew",      lastname:"Davis"},     //29
      { name: "Kevin Costner",     firstname:"Kevin",       lastname:"Costner"},   //30
      { name: "Ashton Kutcher",    firstname:"Ashton",      lastname:"Kutcher"},   //31
      { name: "Sela Ward",         firstname:"Sela",        lastname:"Ward"},      //32
      { name: "John McTiernan",    firstname:"John",        lastname:"McTiernan"}, //33
      { name: "Alec Baldwin",      firstname:"Alec",        lastname:"Baldwin"},   //34
      { name: "Scott Glenn",       firstname:"Scott",       lastname:"Glenn"},     //35
      { name: "Sam Neill",         firstname:"Sam",         lastname:"Neill"},     //36
      { name: "James Earl Jones",  firstname:"James",       lastname:"Jones"},     //37
      { name: "Carlos Saloio",     firstname:"Carlos",      lastname:"Saloio"},    //38
      { name: "Ralph Macchio",     firstname:"Ralph",       lastname:"Macchio"},   //39
      { name: "Pat Morita",        firstname:"Pat",         lastname:"Morita"},    //40
      { name: "Elisabeth Shue",    firstname:"Elisabeth",   lastname:"Shue"},      //41
  ];                                                                                   
                                                                                        

  return knex(tblName)                                                                 
              .del()                                        //Remove all rows from table
              .then(function()                                                          
              {
                  return knex.insert(rows).into(tblName);   //Insert new rows
              });
};
```

**movie**

```
exports.seed = function(knex, Promise)
{
  var tblName = 'movie';
  
  var rows =
  [
    { rating_id: 4, director_id: 1,  title: "The Rock",                  releaseyr: 1996, score: 90, runtime: 136, overview: "A mild-mannered chemist and an ex-con must lead the counterstrike when a rogue group of military men, led by a renegade general, threaten a nerve gas attack from Alcatraz against San Francisco." },
    { rating_id: 2, director_id: 5,  title: "Night at the Museum",       releaseyr: 2006, score: 90, runtime: 110, overview: "A newly recruited night security guard at the Museum of Natural History discovers that an ancient curse causes the animals and exhibits on display to come to life and wreak havoc." },
    { rating_id: 2, director_id: 6,  title: "The Karate Kid",            releaseyr: 1984, score: 95, runtime: 127, overview: "A handyman/martial arts master agrees to teach a bullied boy karate and shows him that there is more to the martial art than fighting." },
    { rating_id: 3, director_id: 13, title: "Batman Begins",             releaseyr: 2005, score: 95, runtime: 140, overview: "After training with his mentor, Batman begins his war on crime to free the crime-ridden Gotham City from corruption that the Scarecrow and the League of Shadows have cast upon it." },
    { rating_id: 3, director_id: 17, title: "The Count of Monte Cristo", releaseyr: 2002, score: 95, runtime: 131, overview: "A young man, falsely imprisoned by his jealous \"friend,\" escapes and uses a hidden treasure to exact his revenge." },
    { rating_id: 4, director_id: 24, title: "Tombstone",                 releaseyr: 1993, score: 95, runtime: 130, overview: "A successful lawman''s plans to retire anonymously in Tombstone, Arizona, are disrupted by the kind of outlaws he was famous for eliminating." },
    { rating_id: 3, director_id: 29, title: "The Guardian",              releaseyr: 2006, score: 90, runtime: 139, overview: "A high school swim champion with a troubled past enrolls in the U.S. Coast Guard''s \"A\" School, where legendary rescue swimmer Ben Randall teaches him some hard lessons about loss, love, and self-sacrifice." },
    { rating_id: 2, director_id: 33, title: "The Hunt for Red October",  releaseyr: 1990, score: 95, runtime: 135, overview: "In 1984, the USSR''s best submarine captain in their newest sub violates orders and heads for the USA. Is he trying to defect, or to start a war?" },
  ];
      
        
  return knex(tblName)
              .del()                                        //Remove all rows from table
              .then(function()
              {
                  return knex.insert(rows).into(tblName);   //Insert new rows
              });
};
```

**actor\_movie**

```
exports.seed = function(knex, Promise)
{
  var tblName = 'actor_movie';
  
  var rows =
  [
      //The Rock
      { movie_id: 1, person_id: 2},    //Sean Connery
      { movie_id: 1, person_id: 3},    //Nicolas Cage
      { movie_id: 1, person_id: 4 },   //Ed Harris
    
      //Night at the Museum
      { movie_id: 2, person_id: 7},    //Ben Stiller
      { movie_id: 2, person_id: 8},    //Carla Gugino
      { movie_id: 2, person_id: 9},    //Ricky Gervais
      { movie_id: 2, person_id: 10},   //Robin Williams
      { movie_id: 2, person_id: 11},   //Dick Van Dyke
      { movie_id: 2, person_id: 12 },  //Owen Wilson
    
      //The Karate Kid
      { movie_id: 3, person_id: 39},   //Ralph Macchio
      { movie_id: 3, person_id: 40},   //Pat Morita
      { movie_id: 3, person_id: 41 },  //Elisabeth Shue
    
      //Batman Begins
      { movie_id: 4, person_id: 14},   //Christian Bale
      { movie_id: 4, person_id: 15},   //Michael Caine
      { movie_id: 4, person_id: 16 },  //Ken Watanabe
    
      //The Count of Monte Cristo
      { movie_id: 5, person_id: 18},   //Jim Caviezel
      { movie_id: 5, person_id: 19},   //Guy Pearce
      { movie_id: 5, person_id: 20},   //Richard Harris
      { movie_id: 5, person_id: 21},   //Dagmara Dominczyk
      { movie_id: 5, person_id: 22},   //Luis Guzm�n
      { movie_id: 5, person_id: 23 },  //Michael Wincott
    
      //Tombstone
      { movie_id: 6, person_id: 25},   //Kurt Russell
      { movie_id: 6, person_id: 26},   //Val Kilmer
      { movie_id: 6, person_id: 27},   //Sam Elliott
      { movie_id: 6, person_id: 28 },  //Terry O'Quinn
    
      //The Guardian
      { movie_id: 7, person_id: 30},   //Kevin Costner
      { movie_id: 7, person_id: 31},   //Ashton Kutcher
      { movie_id: 7, person_id: 32 },  //Sela Ward
    
      //The Hunt for Red October
      { movie_id: 8, person_id: 2},    //Sean Connery
      { movie_id: 8, person_id: 34},   //Alec Baldwin
      { movie_id: 8, person_id: 35},   //Scott Glenn
      { movie_id: 8, person_id: 36},   //Sam Neill
      { movie_id: 8, person_id: 37},   //James Earl Jones
  ];
      
      
  return knex(tblName)
              .del()                                        //Remove all rows from table
              .then(function()
              {
                  return knex.insert(rows).into(tblName);   //Insert new rows
              });
};
```

**tag\_movie**

```
exports.seed = function(knex, Promise)
{
  var tblName = 'tag_movie';
  
  var rows =
  [
      //The Rock
      { movie_id: 1, tag_id: 2},    //Action
      
      //Night at the Museum
      { movie_id: 2, tag_id: 2},    //Action
      { movie_id: 2, tag_id: 4},    //Comedy
      
      //The Karate Kid
      { movie_id: 3, tag_id: 7 },   //Martial Arts
  
      //Batman Begins
      { movie_id: 4, tag_id: 2 },   //Action
      
      //The Count of Monte Cristo
      { movie_id: 5, tag_id: 7 },   //Drama
  
      //Tombstone
      { movie_id: 6, tag_id: 21 },  //Western
  
      //The Guardian
      { movie_id: 7, tag_id: 7},    //Drama
      
      //The Hunt for Red October
      { movie_id: 8, tag_id: 7},    //Drama
  ];
      
      
  return knex(tblName)
              .del()                                        //Remove all rows from table
              .then(function()
              {
                  return knex.insert(rows).into(tblName);   //Insert new rows
              });
};
```

now run the seed using the command `knex seed:run`. It will generate the dummy data we require for our application.


kamal@konfinity.com

Some of the content have been taken from various sources. Due to limitation of resources we cannot give due accrediation to the respective authors. From next versions we will try to include the sources. 
