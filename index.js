const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Post = require("./database/models/Post");
const fileUpload = require("express-fileupload");
const expressSession = require("express-session");
const connectMongo = require("connect-mongo");
const connectFlash = require("connect-flash");
const edge = require("edge.js");

//middlewares
const auth = require("./middleware/auth");
const redirectIfAuthenticated = require("./middleware/redirectIfAuthenticated");

//controllers
const createPostController = require("./controllers/createPost");
const homePageController = require("./controllers/homePage");
const storePostController = require("./controllers/storePost");
const getPostController = require("./controllers/getPost");
const storePost = require("./middleware/storePost");
const createUserController = require("./controllers/createUser");
const storeUserController = require("./controllers/storeUser");
const loginController = require("./controllers/login");
const loginUserController = require("./controllers/loginUser");
const logoutController = require("./controllers/logout");
const app = express();
const PORT = process.env.port || 4000;
app.use(express.static(__dirname + "/public"));
// Configure Edge for production if need to
// config({ cache: process.env.NODE_ENV === 'production' });
const { config, engine } = require("express-edge");
mongoose
	.connect("mongodb://localhost:27017/node-blog", {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log("You are connected now"))
	.catch((error) => console.log("Something went wrong" + error));
const mongoStore = connectMongo(expressSession);
//setting middlewares
app.use(engine);
app.set("views", `${__dirname}/views`);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(fileUpload());
app.use("/posts/store", storePost);
app.use(
	expressSession({
		secret: "secret",
		store: new mongoStore({
			mongooseConnection: mongoose.connection,
		}),
	})
);
app.use(connectFlash());
app.use("*", (req, res, next) => {
	edge.global("auth", req.session.userId);
	next();
});

app.get("/", homePageController);
app.get("/post/:id", getPostController);
app.get("/posts/new", auth, createPostController);
app.post("/posts/store", auth, storePost, storePostController);
app.get("/auth/register", redirectIfAuthenticated, createUserController);
app.post("/users/register", redirectIfAuthenticated, storeUserController);
app.get("/auth/login", redirectIfAuthenticated, loginController);
app.post("/users/login", redirectIfAuthenticated, loginUserController);
app.get("/auth/logout", redirectIfAuthenticated, logoutController);

app.get("/about.html", (req, res) => {
	res.sendFile(__dirname + "/pages/about.html");
});

app.get("/contact.html", (req, res) => {
	res.sendFile(__dirname + "/pages/contact.html");
});

app.listen(PORT, () => {
	console.log("Server is running at " + PORT);
});
