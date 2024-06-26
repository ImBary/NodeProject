const LocalStrategy = require('passport-local').Strategy;
const api = require('../api/api'); 
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

    passport.use(new LocalStrategy({ usernameField: 'username', passwordField: 'code' }, authenticateUser));//Ustawia pola 'username' i 'code' jako identyfikatory logowania ii używa authenticateUser do weryfikacji.

    passport.serializeUser((user, done) => {
        done(null, user.id); // Określa jak zapisać użytkownika w sesji zapiisuje id
    });

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await api.getUserById(id);
            done(null, user); // Określa jak odtworzyć obiekt użytkownika z danych sesji pobiera na podstawie id
        } catch (error) {
            done(error);
        }
    });
}

module.exports = initialize;