const mongoose = require('mongoose');

//mongoose.connect('mongodb+srv://deploy:homemaranha@cluster0-bgfbm.mongodb.net/test?retryWrites=true&w=majority');
mongoose.connect('mongodb+srv://deploy:homemaranha@cluster0-bgfbm.mongodb.net/bibiboom?retryWrites=true&w=majority');

mongoose.Promise = global.Promise;

module.exports = mongoose;
