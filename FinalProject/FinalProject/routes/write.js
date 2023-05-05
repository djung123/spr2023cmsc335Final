const express = require('express');
const router = express.Router();


router.get("/", async (request, response) => {

    let variables = {isAuthenticated: request.oidc.isAuthenticated(), user: request.oidc.user};

    response.render("write", variables);
});
 
module.exports = router;