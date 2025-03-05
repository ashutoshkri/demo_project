const express = require("express");
const passport = require("passport");
const session = require("express-session");
const bodyParser = require("body-parser");
const connectDB = require("./db"); // MongoDB connection
const User = require("./models/user"); // User model
// const  connectEnsureLogin = require("connect-ensure-login");

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// Session setup
app.use(
  session({
    secret: "ThisIsASecretKey", // Replace with a strong secret
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 1000 },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Initialize Passport.js
app.use(passport.initialize());
app.use(passport.session());

// Connect to MongoDB
connectDB();

// Configure Passport.js
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Routes
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.get("/register", (req, res) => {
  res.send(`
        <h1>Register</h1>
        <form method="POST" action="/register">
            <input type="text" name="username" placeholder="Username" required />
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Register</button>
        </form>
    `);
});

app.post("/register", (req, res) => {
  User.register(
    new User({ username: req.body.username, email: req.body.email }),
    req.body.password,
    (err, user) => {
      if (err) {
        return res.send(`<h1>Error: ${err.message}</h1>`);
      }
      passport.authenticate("local")(req, res, () => {
        res.redirect("/dashboard");
      });
    }
  );
});

app.get("/login", (req, res) => {
  res.sendFile(__dirname + "/public/login.html");
});
app.get("/secret", (req, res) => {
  res.sendFile(__dirname + "/public/secret.html");
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/",
  })
);
//store the data in session
app.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) {
    res.send(
      `<h1>Welcome to your dashboard, ${req.user.username}!</h1><a href="/secret">secret page</a> or <a href="/logout">Logout</a>`
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.send(`<h1>Error: ${err.message}</h1>`);
    }
    res.redirect("/");
  });
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
