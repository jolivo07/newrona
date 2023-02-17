const expres = require('express');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');

const app = expres();

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.engine('.hbs', exphbs.engine({
    defaultLayout: "main.hbs",
    extName: ".hbs"
}));

app.set('view engine', '.hbs');

// midelwares 
app.use(morgan('dev'));
app.use(expres.urlencoded({extended: true}));

// routes
app.use(require('./routes/index.js'))

// static files
app.use(expres.static(path.join(__dirname, 'public')));
module.exports = app;