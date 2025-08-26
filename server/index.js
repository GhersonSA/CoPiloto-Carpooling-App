const express = require('express');
const pool = require('./db/connection.js')
const auth = require('./middlewares/auth.js');
const cors = require('cors')
require('dotenv').config();

const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

const UserRepository = require('./userRepository.js');
const { PORT, SECRET_JWT_KEY, ACCESS_TOKEN_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN } = require('./config.js');

const usersRouter = require('./routes/users');
const driversRoutes = require("./routes/drivers");
const passengersRouter = require('./routes/passengers');
const passengerProfilesRouter = require('./routes/passengerProfiles');
const paymentsRouter = require('./routes/payments');
const routesRouter = require('./routes/routes');
const routePassengersRouter = require('./routes/routePassengers');
const ratingsRouter = require('./routes/ratings');
const rolesRouter = require('./routes/roles');


const app = express();
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = process.env.NODE_ENV === 'production'
  ? ['https://copiloto-carpooling.vercel.app']
  : ['http://localhost:5173'];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.disable('x-powered-by');

app.use('/users', usersRouter);
app.use("/drivers", driversRoutes);
app.use('/passengers', passengersRouter);
app.use('/passengerProfiles', passengerProfilesRouter);
app.use('/payments', paymentsRouter);
app.use('/routes', routesRouter);
app.use('/routePassengers', routePassengersRouter);
app.use('/ratings', ratingsRouter);
app.use('/roles', rolesRouter);

function createTokens(user) {
  const accessToken = jwt.sign(
    { id: user._id || user.id, username: user.username },
    SECRET_JWT_KEY,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
  );

  const refreshToken = jwt.sign(
    { id: user._id || user.id, username: user.username },
    SECRET_JWT_KEY,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );

  return { accessToken, refreshToken };
}

app.use((req, res, next) => {
  const token = req.cookies.access_token

  req.session = { user: null }

  try {
    const data = jwt.verify(token, SECRET_JWT_KEY)
    req.session.user = data
  } catch {}

  next()
})

app.get('/', (req, res) => {
  res.send('Servidor Express funcionando correctamente 🚀');
  const { user } = req.session
  res.render('index', user)
});

app.get('/me', auth, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    roles: req.user.roles || [], // roles que ya tenga
  });
});
/*
app.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ message: 'No autorizado' });
  }

  res.json({
    username: req.session.user.username,
    role: req.session.user.role || null,
  });
});
*/
app.post('/login', async (req, res) => {
  const { username, password } = req.body

  try {
    const user = await UserRepository.login({ username, password });
    const { accessToken, refreshToken } = createTokens(user);

    res
      .cookie('access_token', accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 1000 * 60 * 60,
      })
      .cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      })
      .send({ user })
  } catch (error) {
    res.status(401).send(error.message)
  }
})

app.post('/refresh_token', (req, res) => {
  const refreshToken = req.cookies.refresh_token;
  if (!refreshToken) return res.status(401).send('Refresh token missing');

  try {
    const data = jwt.verify(refreshToken, SECRET_JWT_KEY);

    const accessToken = jwt.sign(
      { id: data.id, username: data.username },
      SECRET_JWT_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      maxAge: 1000 * 60 * 60,
    });

    res.send({ message: 'Access token refreshed' });
  } catch (err) {
    res.status(401).send('Invalid refresh token');
  }
});

app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  console.log(req.body);
  try {
    const id = await UserRepository.create({ username, email, password });
    res.send({ id });
  } catch (error) {
    res.status(400).send(error.message);
  }
})

app.post('/logout', (req, res) => {
  res
    .clearCookie('access_token')
    .clearCookie('refresh_token')
    .json({ message: 'Logout successful' })
})

app.post('/protected', (req, res) => {
  const { user } = req.session;
  if (!user) return res.status(403).send('Access not authorized')
  res.render('protected', user)
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
