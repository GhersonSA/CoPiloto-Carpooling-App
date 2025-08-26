const {
    PORT = 1234,
    SALT_ROUNDS = 10,
    SECRET_JWT_KEY = 'this-secret-jwt-key-from-copiloto',
    ACCESS_TOKEN_EXPIRES_IN = '1h',
    REFRESH_TOKEN_EXPIRES_IN = '7d'
} = process.env

module.exports = {
    PORT,
    SALT_ROUNDS: Number(SALT_ROUNDS),
    SECRET_JWT_KEY,
    ACCESS_TOKEN_EXPIRES_IN,
    REFRESH_TOKEN_EXPIRES_IN
}