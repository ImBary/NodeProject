const connection = require('../connection');

const getUsers = async () => {
    try {
        const res = await connection.promise().query('SELECT * FROM users');
        console.log(res[0]);
        return res[0];
    } catch (err) {
        console.error(err);
        throw err;
    } finally {
        connection.end();
    }
};

module.exports = {
    getUsers
};