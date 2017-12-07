let fs = require('fs');
let xml2js = require('xml2js');
let parser = xml2js.Parser()
let util = require('util')
let moment = require('moment-msdate')

//console.log(moment());

//console.log(moment('14/01/2014'));

//console.log(moment("2013-01-01T00:00:00"));

//console.log(moment.fromOADate('40910'));

function dateParse(string) { //parses dates in DD/MM/YYYY, ISO8601, or MSDate format
    //check for pattern 1, 2 or 3. if none, invalid date format
    //pattern 1: DD/MM/YYYY, convert into YYYY-MM-DD and process with moment()
    //pattern 2: ISO8601, processed directly with moment()
    //pattern 3: OLE Automation date (MSDate), processed with moment.fromOADate()
    let pattern1 = /^\d\d\/\d\d\/\d\d\d\d$/;
    let pattern2 = /^\d\d\d\d-\d\d-\d\dT\d\d:\d\d:\d\d$/;
    let pattern3 = /^\d\d\d\d\d$/;
    let date
    if (pattern1.test(string)) {
        let chunks = string.split('/');
        chunks.reverse();
        string = chunks[0]+'-'+chunks[1]+'-'+chunks[2];
        date = moment(string).format('ll');
    } else if (pattern2.test(string)) {
        date = moment(string).format('ll');
    } else if (pattern3.test(string)) {
        date = moment.fromOADate(string).format('ll');
    } else {
        date = 'ERROR'
    }
    return date
}

console.log(dateParse('40959'));

// let data = fs.readFileSync('Transactions2012.txt', 'utf8');
//
// let output
// parser.parseString(data, function(err, result) {
//     //console.log(util.inspect(result, false, null));
//     console.log(result['TransactionList']['SupportTransaction'][0]['$']['Date']);
//     output = result['TransactionList']['SupportTransaction'][0]['Parties'][0]['From'][0];
// })
//
// console.log(output)
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

// fs.readFile('Transactions2013.json', 'utf8', function(err,data) {
//     let transactions = JSON.parse(data)
//     console.log(transactions[1])
//     console.log(transactions[1]['ToAccount'])
// });
//
// fs.readFile('Transactions2013.json', 'utf8', function(err,data) {
//     let transactions = JSON.parse(data)
//     console.log(transactions[1])
//     console.log(transactions[1]['ToAccount'])
// });


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