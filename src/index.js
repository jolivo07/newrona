const app = require('./app')

app.listen(app.get('port'))
console.log("Server Port", app.get('port'))
