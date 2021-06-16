// Imports
const express = require ('express');
const router = express.Router();
const morgan = require('morgan');
const fs = require('fs');


// Config
const app = express();
const PORT = process.env.PORT || 4000;
const path = require('path');
const { json } = require('express');    
const options = { root: path.join(__dirname) };

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(morgan('dev'));

// Cors headers
app.use((req, res, next) => {
    res.append('Access-Control-Allow-Origin', ['*']);
    res.append('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.append('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

// Get contact info
app.get('/api/contact', (req, res) => {
    res.sendFile('data/contact.json', options)
});

// Get image list
app.get('/api/img', (req, res) => {
    res.sendFile('data/img.json', options)
});

// Update contact info
app.post('/api/contact', (req, res) => {
    fs.readFile('./data/contact.json', (err, rawData) => {
        if(err){
            console.log(err);
        } else {
            let oldData = JSON.parse(rawData)
            if(req.body.number){
                oldData.number = req.body.number
            }
            if(req.body.email){
                oldData.email = req.body.email
            }
            console.log(req.body)
            fs.writeFile('./data/contact.json', JSON.stringify(oldData, null, 2), err => {
                if(err){
                    console.log(err)
                }
            })
            res.send('Kontakt information opdateret')
        }
    })
})

// Serve static images
app.use('/static', express.static('data/images'));

// Listen for requests
app.listen(PORT, () => console.info('App kører på port: ' + PORT ));