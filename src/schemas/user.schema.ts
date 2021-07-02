import * as mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';

export const UserSchema = new mongoose.Schema({
  firstname: String,
  lastname: String,
  email: {
    type: String,
    unique : true
  },
  password: String,
  mobilenumber: String,
  gender: {
    type: String,
    enum: ['male', 'female'],
    default: 'male'
  },
  created: Date,
  modified: {
      type: Date,
      default: Date.now
    }
});


UserSchema.pre('save', function(next) {
  var user = this;
  if (!user.isModified('password')) return next();
  // generate a salt
  bcrypt.genSalt(10, function(err, salt) {
      if (err) return next(err);
      // hash the password using our new salt
      bcrypt.hash(user['password'], salt, function(err, hash) {
          if (err) return next(err);
          // override the cleartext password with the hashed one
          user['password'] = hash;
          next();
      });
  });
});