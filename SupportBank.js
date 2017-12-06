const fs = require('fs');
const readline = require('readline-sync');

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
// logger.trace('Trace');
// logger.debug('Debug');
// logger.info('Information');
// logger.warn('Warning');
// logger.error('Error');
// logger.fatal('Fatal error')

//let parse = require('csv-parse');
class Account {
    constructor(balance = 0, transacts = []) {
        this.balance = balance;
        this.transacts = transacts;
    }
}

class Transaction {
    constructor(date, source, target, narrative, amount) {
    this.date = date;
    this.source = source;
    this.target = target;
    this.narrative = narrative;
    this.amount = amount;
    }
}

function splitLines(data) {//splits the raw csv input into an array of lines
    return data.split('\n');
}

function readLine(line) {//splits a line into an array of column entries
    return line.split([',']);
}

function processLines(lines) {//the function to process each line
    let transactions = [];
    for (let i = 1; i < lines.length-1; i++) {//iterate over lines, starting from the second line to avoid header row
        transactions[i-1] = readLine(lines[i]); //this could be replaced with a transaction class for more clarity later
    }
    return transactions
}

function initialiseAccounts(transactions) {//creates empty database for the accounts, based on the transaction data
    let accountMap = new Map();
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i][1];
        let target = transactions[i][2];
        if (accountMap.get(source) === undefined) { //if new source name encountered, creates new account for them
            accountMap.set(source, new Account());
        }
        if (accountMap.get(target) === undefined) { //if new target name encountered, creates new account for them
            accountMap.set(target, new Account());
        }
    }
    return accountMap
}

function populateAccounts(transactions, accountMap) {//populates the database
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i][1];
        let target = transactions[i][2];
        let value = parseFloat(transactions[i][4]);
        accountMap.get(source).balance -= value;
        accountMap.get(source).transacts[accountMap.get(source).transacts.length] = i;
        accountMap.get(target).balance += value;
        accountMap.get(target).transacts[accountMap.get(target).transacts.length] = i;
    }
    return accountMap
}

function populateTransacts(transactions, accountMap, accountTransacts) {
        /*Add the transaction number to the lists of transactions for the accounts.
        The transaction number is the index of the transaction in the 'transactions' list*/
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i][1];
        let target = transactions[i][2];
        accountTransacts[accountMap.get(source)][accountTransacts[accountMap.get(source)].length] = i;
        accountTransacts[accountMap.get(target)][accountTransacts[accountMap.get(target)].length] = i;
    }
    return accountTransacts
}



// function takeCommand() {
//     console.log('Please enter a command:');
//     let command = readline.prompt();
//     let commandType;
//     if (command.substr(0,5) === 'List ') {
//         //test if it starts with 'List ' and if so, do this
//         let command = command.substr(5, command.length - 5);
//         commandType = 'list';
//     } else if (command.substr(0,12) === 'Import File ') {
//         //otherwise, test if it starts with 'Import File' and if so, do this
//         let command = command.substr(12, command.length - 12);
//         commandType = 'file';
//     } else {
//         //error case
//         command = false;
//         commandType = 'error';
//     }
//     return [command, commandtype]
// }


// let controls = takeCommand();
// let command = controls[0];
// let commandType = controls[1];
// if commandType = 'file'

//fs.readFile('DodgyTransactions2015.csv', 'utf8',function(err,data){
fs.readFile('Transactions2014.csv', 'utf8', function(err,data) {

    let lines = splitLines(data); //splits the raw text into a list of lines
    let transactions = processLines(lines); //splits each line into a list of columns
    let accountMap = initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
    accountMap = populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values


    console.log('Please enter a command:'); //requests command from user
    let command = readline.prompt(); //takes in command from user
    let commandCore = command.substr(5, command.length - 5); //extracts the variable part of the command
    // Valid commands are of the form 'List [X]' where [X] is either 'All' or an account name. Only [X] need be kept.



    if (commandCore === 'All') {
        for (let key of accountMap.keys()) {
            let output = key + ' ' + Math.round(accountMap.get(key).balance*100)/100; //collects name and rounded balance
            console.log(output); //prints name and balance on new line
        }
    } else if (accountMap.get(commandCore) === undefined) {
        console.log('Invalid command or account name.'); //if command isn't All or a valid account name, error message
    } else {
        let transacts = accountMap.get(commandCore).transacts; //get list of transaction #s for the account name
        transacts.forEach(function(transactionID) { //iterate over each transaction #
            let transaction = transactions[transactionID]; //get the list of properties for the specific transaction
            let output = transaction[0] + ' ' + transaction[3] + ' ' + transaction [4]; //suture them together for output
            console.log(output);
        })
    }
});



// function processTransaction(transaction) {
//     return new Transaction(transaction[0], transaction[1], transaction[2], transaction[3], transaction[4])
// }
//
// function importDataCSV(filename) {
//     fs.readFile(filename, 'utf8',function(err,data){
//
//         let lines = splitLines(data); //splits the raw text into a list of lines
//         let transactiondata = processLines(lines); //splits each line into a list of columns
//
//         let transactions = transactiondata.map(processTransaction);
//         let accountMap = initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
//         accountMap = populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
//
//     return [accountMap, transactions]
//     })
// }
//
// function importDataJSON('filename') {
//     return [accountMap, transactions]
// }

