let fs = require('fs');

console.log('hello world');

/*
fs.readFile('Transactions2014.csv', 'utf8', function(err,data) {
    if(err) {
        return console.log(err);
    }
    //console.log(data);
    //console.log(data.split('\n'));
    let lines = data.split('\n');
    console.log(lines.length);

    for (let i = 0; i < lines.length; i++) {
        console.log(lines[i]);
    }
});
*/

fs.readFile('Transactions2013.json', 'utf8', function(err,data) {
    let transactions = JSON.parse(data)
    console.log(transactions)
});