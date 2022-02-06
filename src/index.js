const express = require('express');
require('./db/mongoose');
const User = require('./models/User');
const userRouter = require('./routers/user');
const path = require('path');
const hbs = require('hbs');
const session = require('express-session');
const passport = require('passport');
var bodyParser = require('body-parser');
const flash = require('connect-flash');
const { ensureAuthenticated } = require('./middleware/auth');
require('dotenv').config();
require('./middleware/passport')(passport);
var methodOverride = require('method-override');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '../public')));

const viewsPath = path.join(__dirname, './templates/views');
const partialsPath = path.join(__dirname, './templates/partials');

app.set('view engine', 'hbs');
app.set('views', viewsPath);
hbs.registerPartials(partialsPath);

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

// override with POST having ?_method=PUT
app.use(methodOverride('_method'));

// parse application/json
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: true,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

//user routes found in ./routers/user
//app.use(userRouter);

app.get('/login', (req, res) => {
  res.render('login', {
    message: req.flash('error'),
  });
});

app.get('/register', (req, res) => {
  res.render('login');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/about', (req, res) => {
  res.render('about');
});

app.get('/volunteer', (req, res) => {
  res.render('volunteer');
});

app.get('/restaurants', (req, res) => {
  res.render('restaurants');
});

app.get('/profile', ensureAuthenticated, (req, res) => {
  let user = req.user;
  res.render('profile', {
    user,
  });
});

//not found middleware
app.get('*', (req, res, next) => {
  res.render('404', {
    url: req.url,
  });
});

//Starts server
app.listen(port, () => {
  console.log(`Port is live on ${port}`);
});
