const Post = require('../database/models/Post');
 
module.exports = (req, res) => {
    const image = req.files.image;
    image.mv(__dirname +'/public/posts/'+image.name, (error) => {
        Post.create({
            ...req.body,
            image: `/posts/${image.name}`
        }, (error, post) => {
            res.redirect('/');
        });
    })
};