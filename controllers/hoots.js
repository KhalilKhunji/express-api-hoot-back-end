const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verify-token');
const Hoot = require('../models/hoot');

// Public routes


// Protected routes
router.use(verifyToken);

router.post('/', async (req, res) => {
    try {
        req.body.author = req.user.id;
        const hoot = await Hoot.create(req.body);
        res.status(201).json(hoot);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.get('/', async (req, res) => {
    try {
        const hoots = await Hoot.find({}).populate('author').populate('comments.author').sort({ createdAt: 'desc'});
        if(!hoots) return res.status(404).json({error: "Not Found"});
        res.status(200).json(hoots);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.get('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId).populate('author').populate('comments.author');
        if(!hoot) return res.status(404).json({error: "Not Found"});
        res.status(200).json(hoot);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.put('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if(!hoot) return res.status(404).json({error: "Not Found"});
        if (!hoot.author.equals(req.user.id)) {
            return res.status(403).send("You're not allowed to do that!");
        };
        const updatedHoot = await Hoot.findByIdAndUpdate(
            req.params.hootId,
            req.body,
            {new: true}
        );
        updatedHoot._doc.author = req.user;
        res.status(200).json(updatedHoot);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.delete('/:hootId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if(!hoot) return res.status(404).json({error: "Not Found"});
        if (!hoot.author.equals(req.user.id)) {
            return res.status(403).send("You're not allowed to do that!");
        };
        const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
        res.status(200).json(deletedHoot);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.post('/:hootId/comments', async (req, res) => {
    try {
        req.body.author = req.user.id;
        const hoot = await Hoot.findById(req.params.hootId);
        if(!hoot) return res.status(404).json({error: "Not Found"});
        hoot.comments.push(req.body);
        await hoot.save();
        const newComment = hoot.comments[hoot.comments.length - 1];
        newComment._doc.author = req.user;
        res.status(201).json(newComment);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.put('/:hootId/comments/:commentId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if(!hoot) return res.status(404).json({error: "Not Found"});
        const comment = hoot.comments.id(req.params.commentId);
        comment.text = req.body.text;
        await hoot.save();
        res.status(200).json(comment);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

router.delete('/:hootId/comments/:commentId', async (req, res) => {
    try {
        const hoot = await Hoot.findById(req.params.hootId);
        if(!hoot) return res.status(404).json({error: "Not Found"});
        hoot.comments.remove({ _id: req.params.commentId });
        await hoot.save();
        res.status(200).json(hoot.comments);
    } catch (error) {
        res.status(422).json({message: 'Unprocessable Content'});
    };
});

module.exports = router;