let fs = require('fs');

fs.readFile('Transactions2014.csv', 'utf8', function(err,data) {
    if(err) {
        return console.log(err);
    }
    //console.log(data);
    //console.log(data.split('\n'));
    let lines = data.split('\n');
    console.log(lines.length)

    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i])
    }
});