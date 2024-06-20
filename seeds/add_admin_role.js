const bcrypt = require('bcrypt');
const saltRounds = 10;

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.seed = async function(knex) {
    // Hash the password
    const hashedPassword = await bcrypt.hash('admin123', saltRounds);

    // Inserts seed entry
    return knex('users').insert([
        { name: 'admin', code: hashedPassword, role: 'admin' }
    ]);
};
