const express = require('express');
const router = express.Router();
const fs = require('fs');


router.get("/", (request, response) => {
    let variables;
    let content = fs.readFileSync("README.txt", "utf-8");
    if (request.oidc.isAuthenticated()){
        variables = {isAuthenticated: request.oidc.isAuthenticated(), content: content, user: request.oidc.user};
    }else {
        variables = {isAuthenticated: request.oidc.isAuthenticated(), content: content};
    }
    
    response.render("about", variables);
});
 
module.exports = router;