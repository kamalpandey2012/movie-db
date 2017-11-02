exports.up = function (knex, Promise) {
    return knex
        .schema
    //person table
        .createTable('person', function (tbl) {
            //autoincrement id
            tbl.increments();
            tbl
                .string('firstname', 30)
                .notNullable()
                .defaultTo('n/a');
            tbl
                .string('lastname', 30)
                .notNullable()
                .defaultTo('n/a');
            tbl
                .string('junk', 60)
                .notNullable()
                .defaultTo('n/a');
        });

};

exports.down = function (knex, Promise) {
    return knex
        .schema
        .dropTableIfExists('person');
};
