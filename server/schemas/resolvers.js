const { User } = require('../models/index');
// import sign token function from auth
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, args, context) => {
        if (context.user) {
          return Profile.findOne({ _id: context.user._id });
        }
        throw AuthenticationError;
      },
  },

  Mutation: {
    login: async (parent, { username, email, password }) => {
        const user = await User.findOne({ $or: [{ username }, { email }] });
        if (!user) {
            throw AuthenticationError;
        }

        const correctPw = await user.isCorrectPassword(password);

        if (!correctPw) {
            throw AuthenticationError;
        }
        const token = signToken(user);
        return { token, user };
    },
    addUser: async (parent, args) => {
        const user = await User.create(...args);

        if (!user) {
            throw AuthenticationError;
        }
        const token = signToken(user);
        return { token, user };
    },
    saveBook: async (parent, { input }, context) => { // FIX THIS
        const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } }, // FIX THIS 
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            throw AuthenticationError;
        }
        return updatedUser;
    },
    removeBook: async (parent, { bookId }, context) => {
        const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          ).select('-password');
          if (!updatedUser) {
            throw AuthenticationError
          }
          return updatedUser;
    }
  },
};

module.exports = resolvers;

