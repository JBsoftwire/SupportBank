const xml2js = require('xml2js')
let parser = xml2js.Parser()
const moment = require('moment-msdate')
const log4js = require('log4js');
log4js.configure({
    appenders: {
        file: { type: 'fileSync', filename: 'logs/SupportBank.log' }
    },
    categories: {
        default: { appenders: ['file'], level: 'debug'}
    }
});
const logger = log4js.getLogger('SupportBank.log');

// CLASSES

class Account {
    constructor(balance = 0, transactions = []) {
        this.balance = balance;
        this.transactions = transactions;
    }
}
class Transaction {
    constructor(date, source, target, narrative, value) {
        this.date = date;
        this.source = source;
        this.target = target;
        this.narrative = narrative;
        this.value = value;
    }
}

// processing functions

function splitLines(data) {//splits the raw csv input into an array of lines
    try {
        return data.split('\n');
    }
    catch (splitLines) {logger.fatal('failed to separate raw csv into lines')}
}
function readLine(line) {//splits a line into an array of column entries
    try {
        return line.split([',']);
    }
    catch (readLine) {logger.fatal('failed to separate csv lines by commas')}
}
function processLines(lines) {//the function to process each line (save the header) into
    try {
        let output = [];
        let lineID = 1;
        lines.forEach(function(line) {
            if (line != '') {
                output.push(readLine(line))//create new array with only non-blank lines
            } else {logger.warn('blank input on csv file line ' + lineID)}
            lineID++
        })
        return output.slice(1) //cut off header and return
    }
    catch (processLines) {logger.fatal('failed to process line-split csv data')}
}

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
        date = moment(string);//.format('ll');
    } else if (pattern2.test(string)) {
        date = moment(string);//.format('ll');
    } else if (pattern3.test(string)) {
        date = moment.fromOADate(string);//.format('ll');
    } else {
        date = 'ERROR'
    }
    return date //date returned as 'moment' object, parsed into legible format in displayAccount function
}

function processTransaction(transaction, i) { // this function converts a transaction converted from a csv string to a Transaction object
    try {
        if (dateParse(transaction[0]) === 'ERROR') {
            logger.warn('invalid date format on data entry ' + i);
            console.log('Warning: invalid date format on data entry ' + i);
        }
        if (isNaN(parseFloat(transaction[4]))) {
            logger.warn('invalid value format on data entry ' + i);
            console.log('Warning: invalid value format on data entry ' + i);
            console.log('Value will be interpreted as 0.');
            transaction[4] = 0;
        };
        return new Transaction(dateParse(transaction[0]), transaction[1], transaction[2], transaction[3], parseFloat(transaction[4]))
    }
    catch (processTransaction) {logger.fatal('transaction data unreadable')}
}

function processCSV(transactiondata) {
    let transactions = [];
    for (let i = 0; i < transactiondata.length; i++) { // converts lists of column entries into Transaction objects
        transactions.push(processTransaction(transactiondata[i], i + 1))
    }
    return transactions
}

function processJSON(entries) { //this function converts a parsed JSON array of transactions into an array of Transaction objects
    let transactions = [];
    entries.forEach(function(entry) { // converts each JSON entry into a Transaction object
        let transaction = new Transaction(dateParse(entry['Date']), entry['FromAccount'], entry['ToAccount'], entry['Narrative'], entry['Amount']);
        if (dateParse(entry['Date']) === 'ERROR') {
            logger.warn('invalid date format on transaction between '+entry['FromAccount']+' and '+entry['ToAccount']);
            console.log('Warning: invalid date format on transaction between '+entry['FromAccount']+' and '+entry['ToAccount']);
        }
        if (isNaN(parseFloat(entry['Amount']))) {
            logger.warn('invalid value format on transaction on '+dateParse(entry['Date'])+' between '+entry['FromAccount']+' and '+entry['ToAccount']);
            console.log('Warning: invalid value format on transaction on '+dateParse(entry['Date'])+' between '+entry['FromAccount']+' and '+entry['ToAccount']);
            console.log('Value will be interpreted as 0.');
            transaction.value = 0;
        };
        transactions.push(transaction); // appends Transaction to the array of transactions
    })
    return transactions
}
function processXML(entries) { //this function converts a parsed XML array of transactions into an array of Transaction objects
    let transactions = [];
    entries.forEach(function(entry) { // converts each XML entry into a Transaction object
        let transaction = new Transaction(dateParse(entry['$']['Date']), entry['Parties'][0]['From'][0], entry['Parties'][0]['To'][0], entry['Description'], parseFloat(entry['Value']));
        if (dateParse(entry['$']['Date']) === 'ERROR') {
            logger.warn('invalid date format on transaction between '+entry['Parties'][0]['From'][0]+' and '+entry['Parties'][0]['To'][0]);
            console.log('Warning: invalid date format on transaction between '+entry['Parties'][0]['From'][0]+' and '+entry['Parties'][0]['To'][0]);
        }
        if (isNaN(parseFloat(entry['Value']))) {
            logger.warn('invalid value format on transaction on '+dateParse(entry['$']['Date'])+' between '+entry['Parties'][0]['From'][0]+' and '+entry['Parties'][0]['To'][0]);
            console.log('Warning: invalid value format on transaction on '+dateParse(entry['$']['Date'])+' between '+entry['Parties'][0]['From'][0]+' and '+entry['Parties'][0]['To'][0]);
            console.log('Value will be interpreted as 0.');
            transaction.value = 0;
        };
        transactions.push(transaction); // appends Transaction to the array of transactions
    })
    return transactions
}

module.exports = {splitLines, readLine, processLines, dateParse, processTransaction, processCSV, processJSON, processXML}