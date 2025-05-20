// server/src/models/User.js
import { Schema, model, Types } from 'mongoose';

// Schema definition
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      unique: true,
      // simple email regex validator
      match: [/.+@.+\..+/, 'Must use a valid email address']
    },
    thoughts: [
      {
        type: Types.ObjectId,
        ref: 'Thought'
      }
    ],
    friends: [
      {
        type: Types.ObjectId,
        ref: 'User'
      }
    ]
  },
  {
    toJSON: {
      virtuals: true
    },
    id: false
  }
);

// Virtual to get friend count
userSchema.virtual('friendCount').get(function () {
  return this.friends.length;
});

// Create and export the model
const User = model('User', userSchema);
export default User;

