import { Schema, model, Types } from 'mongoose';

/**
 * Formats a timestamp for readability
 */
const formatTimestamp = (timestamp: Date | number | undefined): string => {
  return timestamp ? new Date(timestamp).toLocaleString() : '';
};

/**
 * Reaction sub-schema (used within Thought, not as its own model)
 */
const reactionSchema = new Schema(
  {
    reactionId: {
      type: Schema.Types.ObjectId,
      default: () => new Types.ObjectId()
    },
    reactionBody: {
      type: String,
      required: true,
      maxlength: 280
    },
    username: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: formatTimestamp
    }
  },
  {
    _id: false,
    toJSON: { getters: true }
  }
);

/**
 * Thought schema
 */
const thoughtSchema = new Schema(
  {
    thoughtText: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 280
    },
    createdAt: {
      type: Date,
      default: Date.now,
      get: formatTimestamp
    },
    username: {
      type: String,
      required: true
    },
    reactions: [reactionSchema]
  },
  {
    toJSON: { virtuals: true, getters: true },
    id: false
  }
);

// Virtual to count the number of reactions
thoughtSchema.virtual('reactionCount').get(function () {
  return this.reactions.length;
});

const Thought = model('Thought', thoughtSchema);
export default Thought;
