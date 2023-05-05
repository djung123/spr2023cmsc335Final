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

async function lookUpOneEntry(client, databaseAndCollection, id) {
    let filter = {id: id};
    const result = await client.db(databaseAndCollection.db)
                        .collection(databaseAndCollection.collectionUserID)
                        .findOne(filter);

   return result;
}

async function insertID(client, databaseAndCollection, id) {
    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionUserID).insertOne(id);
}

async function getPosts(client, databaseAndCollection) {

    const cursor = client.db(databaseAndCollection.db)
    .collection(databaseAndCollection.collectionPosts)
    .find({});

    // Some Additional comparison query operators: $eq, $gt, $lt, $lte, $ne (not equal)
    // Full listing at https://www.mongodb.com/docs/manual/reference/operator/query-comparison/
    const result = await cursor.toArray();
    return result;
}

function postSlice(arr, num){
    
    let end = num*10;
    let start = end - 10;
    let temp = arr.slice(start, end);
    return temp;
}

function indexArr(page, totalpage){
    let start = page;
    while (start%10 !== 0){ 
        start -= 1;
    }

    let end = (((start/10)+1)*10);
    let arr = [];
    if (end <= totalpage){
        for (let x = start; x < end; x++){
            arr.push(x+1);
        }
    }else {
        for (let x = start; x < totalpage; x++){
            arr.push(x+1);
        }
    }
    return arr;
}

router.get("/", async (request, response) => {

    let variables;
    let user;

    let page = request.query.page;

    
    if (request.oidc.isAuthenticated()) {
        user = request.oidc.user;
        if (page === undefined){
            variables = {isAuthenticated: request.oidc.isAuthenticated(), 
                content: page, 
                user: user};

                try {
                    await client.connect();
                    let obj = await lookUpOneEntry(client, databaseAndCollection, user.name);
                    let obj2 = await getPosts(client, databaseAndCollection);
                    obj2 = obj2.reverse();
                    let listOfIndex = [];
                    obj2.forEach((element, index) => {
                        listOfIndex.push(index+1);
                    });
                    listOfIndex = postSlice(listOfIndex.reverse(), page);
    
                    let totalPage = Math.ceil(obj2.length / 10);
                    
                    if (totalPage === 0){
                        totalPage = 1;
                    }
    
        
                    //IF the ID is new, add to the db
                    if (obj === null){
                        await insertID(client, databaseAndCollection, {id: user.name});
                        let numbers = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).findOne({});
                        let members = numbers.NumberOfMembers;
                        members += 1;
                        await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).updateOne({}, {$set: {NumberOfMembers: members}})   
                    }

                } catch (e) {
                    console.error(e);
                } finally {
                    await client.close();
                }
            

        }else{
            
            try {
                await client.connect();
                let obj = await lookUpOneEntry(client, databaseAndCollection, user.name);
                let obj2 = await getPosts(client, databaseAndCollection);
                obj2 = obj2.reverse();
                let listOfIndex = [];
                obj2.forEach((element, index) => {
                    listOfIndex.push(index+1);
                });
                listOfIndex = postSlice(listOfIndex.reverse(), page);

                let totalPage = Math.ceil(obj2.length / 10);
                
                if (totalPage === 0){
                    totalPage = 1;
                }
                
                let indexarr = indexArr(Number(page), totalPage);

    
                //IF the ID is new, add to the db
                if (obj === null){
                    await insertID(client, databaseAndCollection, {id: user.name});
                    let numbers = await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).findOne({});
                    let members = numbers.NumberOfMembers;
                    members += 1;
                    await client.db(databaseAndCollection.db).collection(databaseAndCollection.collectionVisits).updateOne({}, {$set: {NumberOfMembers: members}})
        
                    variables = {isAuthenticated: request.oidc.isAuthenticated(), 
                                content: {totalPage: totalPage, list: postSlice(obj2, page), indarr: indexarr}, 
                                user: user, page: page, index: listOfIndex};
                }else {
                    variables = {isAuthenticated: request.oidc.isAuthenticated(),
                                content: {totalPage: totalPage, list: postSlice(obj2, page), indarr: indexarr}, 
                                user: user, page: page, index: listOfIndex};
                }
            } catch (e) {
                console.error(e);
            } finally {
                await client.close();
            }
        }
        

    }else {
        variables  = {isAuthenticated: request.oidc.isAuthenticated(), content: page};
    }


    response.render("home", variables);
});


 
module.exports = router;