const LocalStrategy = require('passport-local').Strategy;
const api = require('../api/api'); // Import your API functions for database interactions
const bcrypt = require('bcrypt');
function initialize(passport) {
    const authenticateUser = async (username, password, done) => {
        try {
            const user = await api.getUserByUsername(username);
            console.log("User object from database:", user);
    
            if (!user) {
                return done(null, false, { message: 'Invalid username' });
            }
    
            const isValidCode = await bcrypt.compare(password, user.code);
    
            if (!isValidCode) {
                return done(null, false, { message: 'Incorrect code' });
            }
    
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'code' }, authenticateUser));

    passport.serializeUser((user, done) => {
        done(null, user.id); // Serialize user ID into the session
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await api.getUserById(id);
            done(null, user); // Deserialize user from session using user ID
        } catch (error) {
            done(error);
        }
    });
}

module.exports = initialize;