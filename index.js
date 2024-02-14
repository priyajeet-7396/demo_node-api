// index.js
import express from 'express';
import  pool from './db.js';
import cors from 'cors';
import Jwt from "jsonwebtoken";

const app = express();
const port = 5000;
app.use(express.json())

app.use(cors());

// handle favicon request 
app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/', async (req, res) => {
    const userEmail = req.query.email;
    if (!userEmail) {
        return res.status(401).json({ error: 'Unauthorized. Please provide an email.' });
      }

  try {
    const { rows } = await pool.query('SELECT book_id, name, price FROM books WHERE user_email = $1', [userEmail]);
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
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ msg: 'Email is required.' });
        }

        const query = {
            text: 'INSERT INTO books (Name, Price, user_email) VALUES ($1, $2, $3) RETURNING *',
            values: [name, price, email],
        };
        const { rows } = await pool.query(query);
        res.json({ msg: "ok", data: rows });
    } catch (err) {
        console.error(err);
        res.json({ msg: err.message });
    }
});


app.post("/signup", async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const query = {
        text: `INSERT INTO users (Name, Email, Password) VALUES ($1, $2, $3) RETURNING *`,
        values: [name, email, password],
      };
      const { rows } = await pool.query(query);
      if (rows.length === 1) {
        const user = rows[0];
        const token = Jwt.sign({ userId: user.user_id, email: user.email , name:user.name }, "secret" , { expiresIn: '1h' });
        res.json({ msg: "User registered successfully", token , user });
      } else {
        res.status(400).json({ msg: "Unable to register user" });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
    }
  });


  app.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Check if the user with the provided email exists
      const query = {
        text: `SELECT * FROM users WHERE email = $1`,
        values: [email],
      };
      const { rows } = await pool.query(query);
  
      if (rows.length === 1) {
        const user = rows[0];
  
        // Compare the provided password with the password in the database
        if (password === user.password) {
          // Passwords match, generate a JWT token
          const token = Jwt.sign({ userId: user.user_id, email: user.email, name: user.name }, 'secret', {
            expiresIn: '1h',
          });
  
          res.json({ msg: 'Login successful', token, user });
        } else {
          // Passwords do not match
          res.status(401).json({ msg: 'Invalid credentials' });
        }
      } else {
        // User with the provided email does not exist
        res.status(401).json({ msg: 'Invalid credentials' });
      }
    } catch (err) {
      console.error(err);
      res.status(500).json({ msg: err.message });
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


app.delete('/:id', async (req, res) => {
    try {
        const query = {
            text: 'DELETE FROM books where book_id = $1 RETURNING *',
            values: [req.params.id],
        };
        const { rows } = await pool.query(query);

        if(rows[0]) {
            return res.json({ msg: "ok", data: rows[0] });
        }

        return res.status(404).json({msg: "not found"})
        
    } catch (err) {
        console.error(err);
    }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

