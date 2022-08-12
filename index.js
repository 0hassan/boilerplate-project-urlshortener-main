require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const dns = require('dns');
const url_ = require('url');

//db conection:
mongoose.connect(process.env.DB_URL).then(() => {
  console.log('Connection Successful!');
});

// data base schema creation
const schema = new mongoose.Schema({ url: 'String' });

//data base model:
const Url = mongoose.model('Url', schema);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.post('/api/shorturl/', function (req, res) {
  const bodyurl = req.body.url;

  const code = dns.lookup(url_.parse(bodyurl).hostname,
    async (err, address) => {
      if (!address) {
        res.json({ error: 'Invalid URL' });
      } else {
        const url = new Url({ url: bodyurl });
        await url.save((err, data)=>{
          res.json({
            orignal_url: data.url,
            short_url: data.id
          });
        });
      }

    }
  );
  console.log('code',code);

});

app.get('/api/shorturl/:id', function (req, res) {
  const id = req.params.id;
  Url.findById(id, (err, data)=>{
    if(!data){
      res.json({error: 'Invalid URL'});
    }else{
      res.redirect(data.url);
    }
  });
  
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
