const connectDB = require("./db");
const User = require("./models/user");

connectDB();

User.register({ username: "sachin" }, "admin");
User.register({ username: "ravi" }, "super");
