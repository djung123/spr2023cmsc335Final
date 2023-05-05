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

async function lookUpOneEntry(client, databaseAndCollection, title, date) {
    let filter = {title: title, date: date};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collectionPosts)
                        .findOne(filter);

   return result;
}

async function loopUpbyID(client, databaseAndCollection, title, id) {
    let filter = {title: title, _id: id};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collectionPosts)
                        .findOne(filter);

   return result;
}

async function insertPost(client, databaseAndCollection, post) {
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionPosts).insertOne(post);
}

async function updatePostNumber(client, databaseAndCollection, num) {
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).updateOne({}, {$set: {NumberOfPosts: num}});
}

async function deletePost(client, databaseAndCollection, id) {
    let filter = {_id: id};
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionPosts).deleteOne(filter);
    
}

router.post("/", async (request, response) => {
    let title = request.body.title;
    let content = request.body.content;
    let id1 = request.body.id;

    let ObjectId = require('mongodb').ObjectId;
    let id = new ObjectId(id1);

    let variables;
    let user;
    let date = new Date();

    if (request.oidc.isAuthenticated()) {
        user = request.oidc.user;
        post = {title: title, content: content, writer: user.nickname, writerID: user.name, date: date}

        try {
            await client.connect();
 
            await deletePost(client, databaseAndCollection, id);
            await insertPost(client, databaseAndCollection, post);

            let obj = await lookUpOneEntry(client, databaseAndCollection, title, date);
            variables  = {isAuthenticated: request.oidc.isAuthenticated(), post: obj, user: user};

        } catch (e) {
            console.error(e);
        } finally {
            await client.close();
        }

    }else {
        variables  = {isAuthenticated: request.oidc.isAuthenticated()};
    }

    response.render("modify-ok", variables);
});
 
module.exports = router;