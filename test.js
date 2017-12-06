let fs = require('fs');

//console.log('hello world');

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
    console.log(transactions[1])
    console.log(transactions[1]['ToAccount'])
});

fs.readFile('Transactions2013.json', 'utf8', function(err,data) {
    let transactions = JSON.parse(data)
    console.log(transactions[1])
    console.log(transactions[1]['ToAccount'])
});

if (1===1 & 2===2){
    console.log('hello world')
}

// const log4js = require('log4js');
// const logger = log4js.getLogger('debug.log');
// log4js.configure({
//     appenders: {
//         file: { type: 'fileSync', filename: 'logs/debug.log' }
//     },
//     categories: {
//         default: { appenders: ['file'], level: 'debug'}
//     }
// });
//
// console.log(Object.getOwnPropertyNames(logger));
// console.log(isNaN(parseFloat('A Cheeseburger')));