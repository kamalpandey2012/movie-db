exports.up = function (knex, Promise) {
    return knex
        .schema
    //<rating table>
        .createTable('rating', function (tbl) {
            tbl.increments();
            tbl
                .string('name', 5)
                .notNullable()
                .unique('uq_rating_name');
        })

        //<movie table>
        .createTable('movie', function (tbl) {
            tbl.increments();
            //foreign key integers
            tbl
                .integer('rating_id')
                .notNullable()
                .references('id')
                .inTable('rating');
            tbl
                .integer('director_id')
                .notNullable()
                .references('id')
                .inTable('person');
            // title(200),overview(999),releaseyr(), score(default=7), date.lastplaydt,
            // runtime(90 default)
            tbl
                .string('title', 200)
                .notNullable()
                .defaultTo('');
            tbl.string('overview', 999);
            tbl.integer('releaseyr');
            tbl
                .integer('score')
                .notNullable()
                .defaultTo(7);
            tbl
                .integer('runtime')
                .notNullable()
                .defaultTo(90);
            tbl.date('lastplaydt');
        })
        //<tag table>
        .createTable('tag', function (tbl) {
            tbl.increments();
            tbl
                .string('name', 30)
                .notNullable()
                .unique('uq_tag_name');
        })

        //<tag movie table>
        .createTable('tag_movie', function (tbl) {
            tbl
                .integer('tag_id')
                .notNullable()
                .references('id')
                .inTable('tag')
                .onDelete('CASCADE');
            tbl
                .integer('movie_id')
                .notNullable()
                .references('id')
                .inTable('movie')
                .onDelete('CASCADE');
            tbl.primary(['tag_id', 'movie_id']);
        })
        //<actor_movie table>
        .createTable('actor_movie', function (tbl) {
            tbl
                .integer('person_id')
                .notNullable()
                .references('id')
                .inTable('person')
                .onDelete('CASCADE');
            tbl
                .integer('movie_id')
                .notNullable()
                .references('id')
                .inTable('movie')
                .onDelete('CASCADE');
        })
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
