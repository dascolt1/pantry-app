const express = require('express');
const router = new express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');
const passport = require('passport');
const validator = require('validator');
const { ensureAuthenticated } = require('../middleware/auth');
//const { fuzzySearch, capitalNames } = require('../helpers/fuzzy');

//post request to USERS
//signs up and creates user
router.post('/register', async (req, res) => {
  //makes sure users first and last name is capitalized
  let { firstName, lastName } = req.body;
  firstName = capitalNames(firstName);
  lastName = capitalNames(lastName);
  req.body.firstName = firstName;
  req.body.lastName = lastName;

  const user = new User(req.body);
  try {
    await user.save();
    res.redirect('/login');
  } catch (e) {
    const { errors } = e;
    let userFacingErrors = [];
    //handles mongo sanitation and passes to front end
    for (var key in errors) {
      if (errors.hasOwnProperty(key)) {
        userFacingErrors.push({ error: errors[key].message });
      }
    }
    res.render('register', {
      userFacingErrors,
    });
  }
});

//logs in user
router.post('/users/login', async (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true,
  })(req, res, next);
});

//logs out a user by erasing token
router.get('/users/logout', async (req, res) => {
  req.logout();
  res.redirect('/');
});

//gets user profile
router.get('/users/me', ensureAuthenticated, async (req, res) => {
  res.send(req.user);
});

//updates users
router.put('/users/me', ensureAuthenticated, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = [
    'firstName',
    'lastName',
    'email',
    'password',
    'field',
    'city',
  ];
  const isValidOperaion = updates.every((update) =>
    allowedUpdates.includes(update)
  );
  if (!isValidOperaion) {
    return res.render('profile', { error: 'Invalid updates' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    let user = req.user;
    await user.save();
    res.render('profile', {
      success: 'Profile updated successfully!',
      user,
    });
  } catch (e) {
    res.status(400).send(e);
  }
});

module.exports = router;
