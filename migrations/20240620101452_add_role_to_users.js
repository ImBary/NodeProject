/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.string('code', 60).nullable().alter(); 
        table.string('role').defaultTo('user'); //dodanie kazdemu uzytkownikowi defultowo usera
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.integer('code').nullable().alter(); 
        table.dropColumn('role'); 
    });
};
