import express from 'express';

var router = express.Router();


router.get('/myIdentity', function (req, res, next) {
    if (req.session.isAuthenticated){ 
        const userInfo = {
            name: req.session.account.name,
            username: req.session.account.username
        };
        res.send ({
            "status": "loggedin",
            "userInfo": userInfo
        });
    } else [
        res.send({ 
            "status": "loggedout"
        })
    ]
});

export default router;