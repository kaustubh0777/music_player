const express = require('express');
const dotenv = require('dotenv');
const bodyparser = require("body-parser");
const path = require('path');
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const connectDB = require('./server/database/connection');

const app = express();

dotenv.config( { path : 'config.env'} )
const PORT = process.env.PORT || 8080

// mongodb connection
connectDB();

const store = new MongoDBStore({
    uri: process.env.MONGO_URI,
    collection: "mySessions",
  });
  
app.use(
session({
    secret: "secret",
    resave: false,
    saveUninitialized: false,
    store: store,
})
);
  

// parse request to body-parser
app.use(bodyparser.urlencoded({ extended : true}))

// set view engine
app.set("view engine", "ejs")
//app.set("views", path.resolve(__dirname, "views/ejs"))

// load assets
app.use('/css', express.static(path.resolve(__dirname, "assets/css")))
app.use('/js', express.static(path.resolve(__dirname, "assets/js")))

// load routers
app.use('/', require('./server/routes/router'))

app.listen(PORT, ()=> { console.log(`Server is running on http://localhost:${PORT}`)});