// index.js
import express from 'express';
import  pool from './db.js';

const app = express();
const port = 3000;


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
            return res.json({msg: "OK", data: rows})
        }
    } catch (err) {
     console.log(err)   
    }
    console.log(req.params.id)
    res.send("working")
})



// app.post('/', (req, res)=>{
//     try {
        
//     } catch (err) {
//         long
//     }
// })

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

