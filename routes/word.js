const router = require('express').Router();
const bot = require('../services/bot');

router.get('/:word', async (req, res, next) => {
    try {
        const { word } = req.params;

        const result = await bot.getResult(word);

        if (result) {
            return res.status(200).json(result);
        } else {
            res.status(204).send();
        }
    } catch (error) {
        console.error(error);
        next();
    }
});

module.exports = router;