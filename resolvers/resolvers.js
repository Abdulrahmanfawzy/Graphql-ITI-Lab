// resolvers.js
import todoModel from "../DB/models/todo.model.js";
import userModel from "../DB/models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const requireAuth = (context, requiredRole = 'user') => {
    if (!context.userId) {
        throw new Error("Authentication required");
    }
    if (requiredRole === 'admin' && context.role !== 'admin') {
        throw new Error("Admin privileges required");
    }
    return context.userId;
};

const resolvers = {
    Query: {
        users: async (_, __, context) => {
            requireAuth(context, 'admin'); // Only admins can see all users
            return userModel.find();
        },
        user: async (_, { id }, context) => {
            requireAuth(context);
            return userModel.findById(id);
        },
        todos: async (_, __, context) => {
            requireAuth(context);
            return todoModel.find().populate("user");
        },
        todo: async (_, { id }, context) => {
            requireAuth(context);
            return todoModel.findById(id).populate("user");
        },
        userTodos: async (_, { userId }, context) => {
            requireAuth(context);
            return todoModel.find({ user: userId }).populate("user");
        },
    },
    Mutation: {
        register: async (_, { name, email, password }) => {
            const hashedPassword = await bcrypt.hash(password, 6);
            const user = new userModel({ 
                name, 
                email, 
                password: hashedPassword,
                role: 'user' // Default role is 'user'
            });
            await user.save();
            const token = jwt.sign({ 
                userId: user._id,
                role: user.role 
            }, process.env.SECRET_KEY);
            return { token, user };
        },

        login: async (_, { email, password }) => {
            const user = await userModel.findOne({ email });
            if (!user) throw new Error("Invalid credentials");

            const valid = await bcrypt.compare(password, user.password);
            if (!valid) throw new Error("Invalid credentials");

            const token = jwt.sign({ 
                userId: user.id,
                role: user.role || 'user'
            }, process.env.SECRET_KEY);
            return { token, user };
        },

        addUser: async (_, { name, email, password }, context) => {
          console.log(context);
          
            requireAuth(context, 'admin');
            const hashedPassword = await bcrypt.hash(password, 6);
            const user = new userModel({ 
                name, 
                email, 
                password: hashedPassword,
                role: 'user'
            });
            return user.save();
        },

        updateUser: async (_, { id, name, email }, context) => {
            requireAuth(context, 'admin');
            return userModel.findByIdAndUpdate(id, { name, email }, { new: true });
        },

        deleteUser: async (_, { id }, context) => {
            requireAuth(context, 'admin');
            await userModel.findByIdAndDelete(id);
            return "user deleted successfully";
        },

        addTodo: async (_, { title, id }, context) => {
            const userId = requireAuth(context);
            const todo = new todoModel({ title, user: id });
            return todo.save();
        },

        updateTodo: async (_, { id, title, completed }, context) => {
            requireAuth(context);
            return todoModel
                .findByIdAndUpdate(id, { title, completed }, { new: true })
                .populate("user");
        },

        deleteTodo: async (_, { id }, context) => {
            requireAuth(context);
            await todoModel.findByIdAndDelete(id);
            return "todo deleted successfully";
        },
    },
};

export default resolvers;