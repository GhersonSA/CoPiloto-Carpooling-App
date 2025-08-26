const crypto = require('crypto');
const pool = require('./db/connection.js')

const copiloto = require('./db/connection.js');
const bcrypt = require('bcrypt');

const { SALT_ROUNDS } = require('./config.js');

class UserRepository {
    static async create ({ username, email, password }) {
        Validation.username(username);
        Validation.email(email);
        Validation.password(password);

        const existingUser = await pool.query(
            'SELECT 1 FROM users WHERE username = $1 OR email = $2',
            [username, email]
        );
        if (existingUser.rows.length > 0) {
            throw new Error('Username already exists');
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const result = await pool.query(
            'INSERT  INTO users (username, email, password) VALUES($1, $2, $3) RETURNING id',
            [username, email, hashedPassword]
        );

        return result.rows[0].id;
    }

    static async login ({ username, password }) {
        Validation.username(username)
        Validation.password(password)

        const result = await pool.query(
            'SELECT * FROM users WHERE username = $1',
            [username]
        );
        if (result.rows.length === 0) {
            throw new Error('username does not exist');
        }

        const user = result.rows[0];

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('password is invalid');
        }

        const { password: _, ...publicUser } = user;
        return publicUser;
    }
}

class Validation {
    static username (username) {
        if (typeof username !== 'string') throw new Error('username must be a string')
        if (username.length < 3) throw new Error('username must be at least 3 characters long')
    }

    static email (email) {
        if (typeof email !== 'string') throw new Error('Email must be a string');
        const re = /\S+@\S+\.\S+/;
        if (!re.test(email)) throw new Error('Email is invalid');
    }
    
    static password (password) {
        if (typeof password !== 'string') throw new Error('Password must be a string')
        if (password.length < 6) throw new Error('Password must be at least 6 characters long')
    }
}

module.exports = UserRepository;