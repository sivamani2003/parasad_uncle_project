const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const path = require('path');
const app = express();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
mongoose.connect('mongodb+srv://sivamanik:A12345678b@cluster0.3onle7m.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', { useNewUrlParser: true, useUnifiedTopology: true });

app.use(bodyParser.json());
app.use(cors());

app.use('/api', authRoutes);

app.listen(5007, () => {
  console.log('Server running on port 5007');
});
