const ExampleItem = require('../../models/ExampleItem');

const express = require('express');
const router = express.Router();

const auth = require('../../middleware/auth/auth');



router.get('/', auth, async (req, res) => {
    let exampleItems = await ExampleItem.find({ user_id: req.user._id })
        .catch(err => {
            console.error(err);
            exampleItems = null;
        });
    if (!exampleItems) return res.status(500).json({ success: false, message: 'Unable to find requested resources.' });

    res.status(200).json({ success: true, data: exampleItems });
});



router.get('/:exampleItem_id', auth, async (req, res) => {
    let exampleItem = await ExampleItem.findOne({ user_id: req.user._id, _id: req.params.exampleItem_id })
        .catch(err => {
            console.error(err);
            exampleItem = null;
        });
    if (!exampleItem) return res.status(500).json({ success: false, message: 'Unable to find requested resource.' });

    res.status(200).json({ success: true, data: exampleItem });
});



router.post('/', auth, async (req, res) => {
    const { data } = req.body;
    let exampleItem = new ExampleItem({ user_id: req.user._id, data })
        .catch(err => {
            console.error(err);
            exampleItem = null;
        });
    if (!exampleItem) return res.status(500).json({ success: false, message: 'Error creating new resource.' });

    try {
        await exampleItem.save();
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error saving new resource.' });
    }

    res.status(201).json({ success: true, data: exampleItem });
});



router.put('/:exampleItem_id', auth, async (req, res) => {
    const { data } = req.body;
    let exampleItem = ExampleItem.findOne({ user_id: req.user._id, _id: req.params.exampleItem_id })
        .catch(err => {
            console.error(err);
            exampleItem = null;
        });
    if (!exampleItem) return res.status(500).json({ success: false, message: 'Unable to find requested resource.' });

    try {
        exampleItem = await exampleItem.update({ data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error updating resource.' });
    }

    res.status(200).json({ success: true, data: exampleItem });
});



router.delete('/:exampleItem_id', auth, async (req, res) => {
    try {
        await ExampleItem.findOneAndDelete({ user_id: req.user._id, _id: req.params.exampleItem_id })
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Error deleting resource.' });
    }

    res.status(200).json({ success: true });
});



module.exports = router;
