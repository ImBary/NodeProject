/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.string('code', 60).nullable().alter(); // Change the 'code' column to a string with a maximum length of 60 characters
        table.string('role').defaultTo('user'); // Add the 'role' column with a default value of 'user'
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.alterTable('users', (table) => {
        table.integer('code').nullable().alter(); // Revert the 'code' column back to an integer
        table.dropColumn('role'); // Remove the 'role' column
    });
};
