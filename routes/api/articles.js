const express = require('express');
const router = express.Router();
const Article = require('../../models/article');
const auth = require('../../middleware/auth');
const ROLE = require('../../config/roles');
const {authAdmin, authUser} = require('../../middleware/authRole');

router.get(
    '/getArticles', async (req, res) => {
        let articles = await Article.find((err, results) => {
            if(err) {
                console.log(err);
            }
        })
        .populate("user","firstName lastName")
        .populate(["category"]);

        res.json(articles);
    }
);

router.post(
    '/myArticles', auth, authUser, async (req,res) => {
        try {
            let articles = await Article
                .find({user: req.user}, "title authorFirstName authorLastName category user")
                .populate("user","firstName lastName")
                .populate("category");

            return res.json(articles);
        } catch (err) {
            return res.status(500).json({error: err.message});
        }
    }
);

router.post(
    '/addArticle', auth, authUser, async (req,res) => {

        let article = new Article({
            title: req.body.title, 
            content: req.body.content,
            category: req.body.category,
            user: req.user
        });

        article.save((err) => {
            if(err) {
                console.log(err);
            }
        });
        
        res.json(article);
});

router.post(
    '/editArticle', async (req,res) => {

    let article = await Article.findById(req.body.id, (err) => {
        if(err) {
            console.log(err);
        }
    });

    res.json(article);

});

router.post(
    '/updateArticle', auth, async (req,res) => {
        let articleBeforeUpdate = await Article.findOne({_id: req.body.id});

        if((req.user == articleBeforeUpdate.user) || (req.role === ROLE.ADMIN)) {
            let article = await Article.findByIdAndUpdate({_id: req.body.id}, {content: req.body.content}, {
                returnOriginal: false
            });
            res.json(article);
        } else {
            res.status(401).json({msg: "User unauthorized to modify this article"});
        }
        
    }
);

router.delete(
    '/deleteArticle', auth, async (req,res) => {
        let articleBeforeUpdate = await Article.findOne({_id: req.headers.id});
            
        if((req.user == articleBeforeUpdate.user) || (req.role === ROLE.ADMIN)) {
            let article = await Article.findByIdAndDelete({_id: req.headers.id});
            res.json(article);
        } else {
            res.status(401).json({msg: "User unauthorized to modify this article"});
        }
    }
);

router.get(
    '/getFilteredArticles', async (req,res) => {
        let articles = await Article.find({category: req.query.category}, 'title', (err, results) => {
            if(err) {
                console.log(err);
            }
        }).populate("user","firstName lastName").populate(["category"]);
        res.json(articles);
    });

router.post(
        '/getUsersFilteredArticles', auth, async (req,res) => {
            let articles = await Article.find({category: req.query.category, user: req.user}, 'title', (err, results) => {
                if(err) {
                    console.log(err);
                }
            }).populate("user","firstName lastName").populate(["category"]);
            res.json(articles);
        });

router.get(
    '/searchArticlesByTitle', async (req,res) => {
        let articles = await Article.find({title: new RegExp(req.query.title, "i")}, 'title', (err, results) => {
            if(err) {
                console.log(err);
            }
        });
        res.json(articles);
    }  
);

router.get(
    '/getSpecificArticle', async (req, res) => {
        let article = await Article.find({_id: req.query.id}, (err, results) => {
            if(err) {
                console.log(err);
            }
        })
        .populate("user","firstName lastName")
        .populate(["category"]);

        res.json(article);
    }
);

module.exports = router;