/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('users', table => {
      table.increments('id');
      table.string('name');
      table.integer('code');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('users');
  };
