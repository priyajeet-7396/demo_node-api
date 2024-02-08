const express = require("express");
const app = express();
const router = express.Router();

require('dotenv').config();
app.use(express.json());

const pool = require('./database');


app.get("/", async (req, res) => {
    try {
        const { rows } = await pool.query("select * from books");
        res.json(rows);
    } catch (error) {
        res.json({ msg: error.msg });
    }
});


app.listen(process.env.PORT, () => console.log("Server is running on port 5000"));
