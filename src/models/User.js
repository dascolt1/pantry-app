const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First Name cannot be left blank'],
    trim: true,
  },
  lastName: {
    type: String,
    required: [true, 'Last Name cannot be left blank'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email cannot be blank'],
    trim: true,
    unique: [true, 'Email already taken'],
    lowercase: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error('Email is invalid');
      }
    },
  },
  password: {
    type: String,
    required: [true, 'Password cannot be blank'],
    trim: true,
    minlength: [7, 'Password must ne atleast 7 characters'],
  },
  field: {
    type: String,
    trim: true,
  },
  city: {
    type: String,
    trim: true,
  },
  avatar: {
    type: Buffer,
  },
});

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('Unable to login');
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    throw new Error('Unable to login');
  }

  return user;
};

userSchema.methods.toJSON = function () {
  const user = this;
  const userObj = user.toObject();

  delete userObj.password;
  //delete userObj.avatar

  return userObj;
};

//hash plain text password
userSchema.pre('save', async function (next) {
  const user = this;

  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
