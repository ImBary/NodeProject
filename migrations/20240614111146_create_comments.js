/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('comments', table => {
      table.increments('id');
      table.string('userName');
      table.string('comment');
      table.integer('userId').unsigned().references('id').inTable('users').onDelete('CASCADE');
      table.integer('postId').unsigned().references('id').inTable('posts').onDelete('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTable('comments');
  };
