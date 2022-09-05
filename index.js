require('dotenv').config();

const PORT = process.env.PORT || 5000;

const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/word', require('./routes/word'), (req, res) => res.status(500).send('Internal server error'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));