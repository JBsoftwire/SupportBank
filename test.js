let fs = require('fs');

fs.readFile('Transactions2014.csv', 'utf8', function(err,data) {
    if(err) {
        return console.log(err);
    }
    console.log(data);
});