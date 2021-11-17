
const { AuthenticationError } = require('apollo-server-express');
const { User } = require(`../models`);
const { signToken } = require('../utils/auth');


const resolvers = {

    
    Query: {
        me: async (parent, args, context) => {

            
            if (context.user) {

                
                const userInfo = await User.findOne({ _id: context.user._id })
                    .select('-password')
                    .populate('books');

                return userInfo;
            }

            
            throw new AuthenticationError("Error: user not logged in");

        }
    },

   
    Mutation: {

       
        addUser: async (parent, args) => {


            try {


                const user = await User.create(args)

                console.log(user);


                const token = signToken(user);


                return { token, user };

            } catch (error) {


                console.log(error)
            }
        },


        login: async (parent, { email, password }) => {


            const user = await User.findOne({ email });

         
            if (!user) {
                throw new AuthenticationError("Error: Incorrect email or password.");
            }


            const validPassword = await user.isCorrectPassword(password);


            if (!validPassword) {
                throw new AuthenticationError("Error: Incorrect email or password.");
            }

          
            const token = signToken(user);


            return { token, user }

        },


        saveBook: async (parent, args, context) => {

            console.log(args);
            console.log(context);


            if (context.user) {


                const updatedUser = await User.findOneAndUpdate(


                    { _id: context.user._id },
                    { $addToSet: { savedBooks: args.input } },
                    { new: true, runValidators: true }

                );


                return updatedUser;
            }


            throw new AuthenticationError("You need to be logged in!");
        },


        removeBook: async (parent, args, context) => {


            if (context.user) {


                const updatedUser = await User.findOneAndUpdate(


                    { _id: context.user._id },
                    { $pull: { savedBooks: { bookId: args.bookId } } },
                    { new: true }
                );


                return updatedUser;
            }


            throw new AuthenticationError("Please login in!");
        },
    },
}

module.exports = resolvers;