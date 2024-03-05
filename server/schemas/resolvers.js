const { User } = require('../models/index');
// import sign token function from auth
const { signToken, AuthenticationError } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (parent, { user }) => {
        const foundUser = await User.findOne({
            $or: [{ _id: user._id }, { username }],
        })

        if (!foundUser) {
            throw AuthenticationError;
        }
        return foundUser;
    }
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
    saveBook: async (parent, { input }) => { // FIX THIS
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $addToSet: { savedBooks: input } }, // FIX THIS 
            // exclude password
            { new: true, runValidators: true }
        );

        if (!updatedUser) {
            throw AuthenticationError;
        }
        return updatedUser;
    },
    removeBook: async (parent, { bookId }) => {
        const updatedUser = await User.findOneAndUpdate(
            { _id: user._id },
            { $pull: { savedBooks: { bookId: bookId } } },
            { new: true }
          );
          if (!updatedUser) {
            throw AuthenticationError
          }
          return updatedUser;
    }
  },
};

module.exports = resolvers;

