const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Goal = require('./goal');
const Task = require('./task');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    age: {
      type: Number,
      validate(val) {
        if (val < 10) {
          throw new Error('Age must be greater than 10');
        }
      },
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      validate(val) {
        if (!validator.isEmail(val)) {
          throw new Error('Invalid Email');
        }
      },
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 7,
      validate(val) {
        if (val.toLowerCase().includes('password')) {
          throw new Error('Password should not contain word Password');
        }
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: {
      type: Buffer,
    },
  },
  {
    timestamps: true,
  },
);

// Delete user tasks when user is removed
userSchema.pre('remove', async function(next) {
  const user = this;
  const goal = await Goal.findOne({ owner: user._id });
  await Task.deleteMany({ goalDetail: goal._id });
  await Goal.deleteMany({ owner: user._id });
  next();
});

userSchema.virtual('goals', {
  ref: 'Goal',
  localField: '_id',
  foreignField: 'owner',
});

userSchema.methods.generateAuthToken = async function() {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, 'thisismynewproject');
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.methods.toJSON = function() {
  const user = this;
  const userObject = { ...user.toObject() };

  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;

  return userObject;
};

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

// Hash the plain test password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
