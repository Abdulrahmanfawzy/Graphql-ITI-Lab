// register(name: String!, email: String!, password: String!): AuthPayload!
// login(email: String!, password: String!): AuthPayload!

const schema = `
    
type user {
    id: ID!
    name: String!
    email: String!
    role: String
}

type todo {
    id: ID!
    title: String!
    completed: Boolean!
    user: user!
}

type Query {
    users: [user!]!
    user(id: ID!): user
    todos: [todo!]!
    todo(id: ID!): todo
    userTodos(userId: ID!): [todo!]!
}

type Authentication {
    token: String!
    user: user!
}

type Mutation {
    register(name: String!, email: String!, password: String!): Authentication!
    login(email: String!, password: String!): Authentication!
    addUser(name: String!, email: String!, password: String!): user!
    updateUser(id: ID!, name: String, email: String): user!
    deleteUser(id: ID!): String!
    addTodo(title: String! , id: ID!): todo!
    updateTodo(id: ID!, title: String, completed: Boolean): todo!
    deleteTodo(id: ID!): String!
}

`;

export default schema;
