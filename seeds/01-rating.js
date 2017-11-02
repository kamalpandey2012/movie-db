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
