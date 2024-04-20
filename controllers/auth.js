const mysql = require("mysql");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE 
});

exports.register = (req, res) => {
    const { name, email, password, passwordconfirm } = req.body;

    db.query('SELECT email FROM users WHERE email=?', [email], (error, results) => {
        if (error) {
            console.log(error);
            return res.status(500).send('Internal Server Error');
        }
        if (results.length > 0) {
            return res.render('register', {
                message: 'That email is already in use'
            });
        } else if (password !== passwordconfirm) {
            return res.render('register', {
                message: 'Passwords do not match'
            });
        }

        // Hash the password before storing it in the database
        bcrypt.hash(password, 8, (hashError, hashedPassword) => {
            if (hashError) {
                console.log(hashError);
                return res.status(500).send('Internal Server Error');
            }

            // Insert the user into the database
            db.query('INSERT INTO users SET ?', { name, email, password: hashedPassword }, (insertError, insertResults) => {
                if (insertError) {
                    console.log(insertError);
                    return res.status(500).send('Internal Server Error');
                }
                
                console.log(insertResults);
                return res.render('register', {
                    message: 'User registered'
                });
            });
        });
    });
};
