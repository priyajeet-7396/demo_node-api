// index.js
import express from 'express';
import  pool from './db.js';

const app = express();
const port = 3000;
app.use(express.json())


// handle favicon request 
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT book_id, name, price FROM books');
    return res.status(200).json({ books: rows });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});


app.get("/:id", async(req, res)=>{
    try {
        const {rows} = await pool.query('select * from books where book_id = $1',[req.params.id]);
        if (rows[0]) {
            return res.json(rows)
        }
    } catch (err) {
        res.json({msg: err.msg})   
    }
})

app.post("/", async (req, res) => {
    try {
        const { name, price } = req.body;
        const query = {
            text: 'INSERT INTO books (Name, Price) VALUES ($1, $2) RETURNING *',
            values: [name, price],
        };
        const { rows } = await pool.query(query);
        res.json({ msg: "ok", data: rows });
    } catch (err) {
        console.error(err);
        res.json({ msg: err.message });
    }
});

app.put('/:id', async (req, res) => {
    try {
        const { name, price} = req.body;
        const query = {
            text: 'UPDATE books set Name = $1, Price = $2 where book_id = $3 RETURNING *',
            values: [name, price ,req.params.id],
        };
        const {rows} = await pool.query(query);
        res.json({ msg: "ok", data: rows });
    } catch (err) {
        console.error(err);
        console.log(err);
    }
})



// app.delete('/:id', async (req, res) => {
//     try {
//         console.log(req.params.id);
//         const query = {
//             text: 'DELETE FROM books where book_id = $1 RETURNING *',
//             values: [req.params.id],
//         };
//         const {rows} = await pool.query(query);
//         res.json({ msg: "ok", data: rows });
//     } catch (err) {
//         console.error(err);
//     }
// });



app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

