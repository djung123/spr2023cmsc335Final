const express = require("express");
const path = require("path");
const app = express();
const bodyParser = require("body-parser"); 
const portNumber = 5000;
const { auth } = require('express-openid-connect');
require("dotenv").config({ path: path.resolve(__dirname, './.env') });

console.log(`Web server started and running at http://localhost:${portNumber}`);


const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.SECRET,
    baseURL: process.env.BASEURL,
    clientID: process.env.CLIENTID,
    issuerBaseURL: process.env.ISSUER
};


// Initialize EJS
app.set("views", path.resolve(__dirname, "templates"));
app.set("view engine", "ejs");

// Init express.router
const index = require("./routes/index");
const home = require("./routes/home");
const write = require("./routes/write");
const writeok = require("./routes/write-ok");
const modify = require("./routes/modify");
const modifyok = require("./routes/modify-ok");
const about = require("./routes/about");


app.use(auth(config));
app.use("/", index);
app.use("/home", home);
app.use("/write", write);
app.use("/read", writeok);
app.use("/modify", modify);
app.use("/modify-ok", modifyok);
app.use("/about", about);



app.listen(portNumber);