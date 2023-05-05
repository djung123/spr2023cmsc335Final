const express = require('express');
const router = express.Router();
const path = require("path");


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


router.get("/", async (request, response) => {
    let variables;

    try {
        await client.connect();
        
        let numbers = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).findOne({});
        let visits = numbers.NumberOfVisits;
        visits += 1;
        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).updateOne({}, {$set: {NumberOfVisits: visits}});


        variables = {isAuthenticated: request.oidc.isAuthenticated(), visits: visits, members: numbers.NumberOfMembers, posts: numbers.NumberOfPosts};
    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
    response.render("index", variables);
});
 
module.exports = router;