// Imports
const express = require ('express');
const router = express.Router();
const morgan = require('morgan');
const fs = require('fs');
const multer = require('multer')


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

const fileStorageEngine = multer.diskStorage({
    destination:(req, file, cb) => {
        cb(null, './data/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
})

const upload = multer({storage: fileStorageEngine})

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
        }
    })
})

// Add new image
app.post('/api/img', upload.single('image'), (req, res) => {
    fs.readFile('./data/img.json', (err, rawData) => {
        if(err){
            console.log(err);
        } else {
            let oldData = JSON.parse(rawData)
            oldData.unshift({
                url: '/static/' + req.file.originalname,
                alt: req.body.alt,
                tag: req.body.tag
            })
            
            fs.writeFile('./data/img.json', JSON.stringify(oldData, null, 4), err => {
                if(err){
                    console.log(err)
                }
                res.status(200)
            })
        }
    })
})

// Delete image
app.delete('/api/img', (req, res) => {
    fs.readFile('./data/img.json', (err, rawData) => {
        if(err){
            console.log(err);
        } else {
            let oldData = JSON.parse(rawData)
            let newData = oldData.filter(item => item.url !== req.body.url)
            fs.unlink('./data/images/' + req.body.url.substring(8), err => {
                if(err){
                    console.log(err)
                }
            })
            fs.writeFile('./data/img.json', JSON.stringify(newData, null, 4), err => {
                if(err){
                    console.log(err)
                }
            })
        }
        res.status(200).send('billed liste opdateret')
    })
})

// Serve static images
app.use('/static', express.static('data/images'));

// Listen for requests
app.listen(PORT, () => console.info('App kører på port: ' + PORT ));