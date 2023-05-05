const express = require('express');
const router = express.Router();
const path = require("path");
const bodyParser = require("body-parser"); 
router.use(bodyParser.urlencoded({extended:false}));


// Initializing DB
require("dotenv").config({ path: path.resolve(__dirname, '../.env') });

const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

// Setting up an object to access them simply
const databaseAndCollection = {db: process.env.MONGO_DB_NAME,
     collectionUserID: process.env.MONGO_COLLECTION1,
    collectionPosts: process.env.MONGO_COLLECTION2,
    collectionVisits: process.env.MONGO_COLLECTION3};

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${userName}:${password}@cluster0.oiifejf.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function loopUpbyID(client, databaseAndCollection, title, id) {
    let filter = {title: title, _id: id};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collectionPosts)
                        .findOne(filter);

   return result;
}


router.get("/", async (request, response) => {
    let title = request.query.title;
    let ObjectId = require('mongodb').ObjectId;
    let id = new ObjectId(request.query.id);
    let variables;
    let user;

    if (request.oidc.isAuthenticated()) {
        user = request.oidc.user;
        
        try {
            await client.connect();
 
            let obj = await loopUpbyID(client, databaseAndCollection, title, id);
            
            variables  = {isAuthenticated: request.oidc.isAuthenticated(), post: obj, user: user};

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    }else {
        variables  = {isAuthenticated: request.oidc.isAuthenticated()};
    }

    response.render("modify", variables);
});

 
module.exports = router;