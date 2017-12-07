const fs = require('fs');
const readline = require('readline-sync');
const xml2js = require('xml2js')
let parser = xml2js.Parser()

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
logger.trace('Initiating program');
// logger.debug('Debug');
// logger.info('Information');
// logger.warn('Warning');
// logger.error('Error');
// logger.fatal('Fatal error')


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
function processTransaction(transaction, i) { // this function converts a transaction converted from a csv string to a Transaction object
    try {
        const datePattern = /\d\d\/\d\d\/\d\d\d\d/;
        if (!datePattern.test(transaction[0])) {
            logger.warn('irregular date format on data entry ' + i);
            console.log('Warning: irregular date format on data entry ' + i);
        };
        if (isNaN(parseFloat(transaction[4]))) {
            logger.warn('invalid value format on data entry ' + i);
            console.log('Warning: invalid value format on data entry ' + i);
            console.log('Value will be interpreted as 0.');
            transaction[4] = 0;
        };
        return new Transaction(transaction[0], transaction[1], transaction[2], transaction[3], parseFloat(transaction[4]))
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
        let transaction = new Transaction(entry['Date'], entry['FromAccount'], entry['ToAccount'], entry['Narrative'], entry['Amount']);
        if (isNaN(parseFloat(entry['Amount']))) {
            logger.warn('invalid value format on data entry for '+entry['Date']+' between '+entry['FromAccount']+' and '+entry['ToAccount']);
            console.log('invalid value format on data entry for '+entry['Date']+' between '+entry['FromAccount']+' and '+entry['ToAccount']);
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
        let transaction = new Transaction(entry['$']['Date'], entry['Parties'][0]['From'][0], entry['Parties'][0]['To'][0], entry['Description'], parseFloat(entry['Value']));
        if (isNaN(parseFloat(entry['Value']))) {
            logger.warn('invalid value format on data entry for '+entry['$']['Date']+' between '+entry['Parties'][0]['From'][0],+' and '+entry['Parties'][0]['To'][0]);
            console.log('invalid value format on data entry for '+entry['$']['Date']+' between '+entry['Parties'][0]['From'][0],+' and '+entry['Parties'][0]['To'][0]);
            console.log('Value will be interpreted as 0.');
            transaction.value = 0;
        };
        transactions.push(transaction); // appends Transaction to the array of transactions
    })
    return transactions
}
function initialiseAccounts(transactions) {//creates empty database for the accounts, based on the transaction data
    let accountMap = new Map();
    transactions.forEach(function(transaction) {//iterates over every transaction
        if (!accountMap.has(transaction.source)) { //if new source name encountered, creates new account for them
            accountMap.set(transaction.source, new Account());
        }
        if (!accountMap.has(transaction.target)) { //if new target name encountered, creates new account for them
            accountMap.set(transaction.target, new Account());
        }
    });
    return accountMap
}
function populateAccounts(transactions, accountMap) {//populates the database with transaction data
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i].source;
        let target = transactions[i].target;
        let value = transactions[i].value;
        accountMap.get(source).balance -= value;
        accountMap.get(source).transactions.push(i);
        accountMap.get(target).balance += value;
        accountMap.get(target).transactions.push(i);
    }
    return accountMap
}


// output functions

function displayAll(accountMap) {

    for (let key of accountMap.keys()) {
        let output = key + ' ' + Math.round(accountMap.get(key).balance*100)/100; //collects name and rounded balance
        console.log(output); //prints name and balance on new line
    }
}

function displayAccount(name, accountMap, transactions) {
    let accountTransactions = accountMap.get(name).transactions; // get list of transaction #s for the account name
    accountTransactions.forEach(function(transactionID) { // iterate over each transaction #
        let transaction = transactions[transactionID]; // pick out the specific transaction
        let output = transaction.date + ' ' + transaction.source + ' ' + transaction.target + ' ' + transaction.narrative;
        // suture together transaction description
        // and then add value based on if debit or credit
        if (transaction.source === name) {
            output += ' ' + -transaction.value;
        } else {
            output += ' ' + transaction.value;
        }
        console.log(output)
    })
}

// import functions

function importDataCSV(filename) {
    logger.debug('Entered CSV reader')
    let data = fs.readFileSync(filename, 'utf8')
    if (data === undefined) {
        logger.fatal('No data found at ' + filename);
    } else {
        logger.info('loaded file: ' + filename);
    }
    let lines = splitLines(data); // splits the raw text into an array of lines
    let transactiondata = processLines(lines); // converts each line into an array of column entries
    let transactions = processCSV(transactiondata); //converts the array of trans. data into an array of Transaction objects
    let accountMap = initialiseAccounts(transactions); // creates an empty Map of account names to Account class objects
    accountMap = populateAccounts(transactions, accountMap); // populates the Account objects with appropriate values
    return [accountMap, transactions]
}

function importDataJSON(filename) {
    logger.debug('Entered JSON reader')
    let data = fs.readFileSync(filename, 'utf8')
    if (data === undefined) {
        logger.fatal('No data found at ' + filename);
    } else  {
        logger.info('loaded file: ' + filename);
    }
    let entries = JSON.parse(data);
    let transactions = processJSON(entries); //converts each JSON entry into a Transaction object
    let accountMap = initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
    accountMap = populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
    return [accountMap, transactions]
}

function importDataXML(filename) {
    logger.debug('Entered XML reader')
    let data = fs.readFileSync(filename, 'utf8')
    if (data === undefined) {
        logger.fatal('No data found at ' + filename);
    } else  {
        logger.info('loaded file: ' + filename);
    }
    let entries
    parser.parseString(data, function(err, result) { //parses the XML
        entries = result['TransactionList']['SupportTransaction'];
    })
    let transactions = processXML(entries);
    let accountMap = initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
    accountMap = populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
    return [accountMap, transactions]
}

// main code

let command;
let accountMap;
let transactions;
let loadedData;

do {
    console.log('Please enter command:');
    command = readline.prompt();
    if (command.substr(0,5) === 'List ' & accountMap !== undefined) {//if data has been successfully loaded, can operate on command
        let subcommand = command.substr(5, command.length - 5);
        switch (subcommand) {
            case 'All':
                displayAll(accountMap);
                break;
            default:
                if (accountMap.get(subcommand) === undefined) {
                    console.log('Invalid account name.'); //if command isn't All or a valid account name, error message
                } else {
                    displayAccount(subcommand, accountMap, transactions);
                }
                break;
        }
    } else if (command.substr(0,12) === 'Import File ') {
        let extension = /\.[a-zA-Z]+$/; // regex to find segments of form '.[alphabetic]' at the end of the line
        let filetype = command.substr(command.search(extension)); //finds index of file extension & extracts
        let filename = command.substr(12);
        switch (filetype) {
            case '.csv':
                loadedData = importDataCSV(filename);
                accountMap = loadedData[0];
                transactions = loadedData[1];
                break;
            case '.json':
                loadedData = importDataJSON(filename);
                accountMap = loadedData[0];
                transactions = loadedData[1];
                break;
            case '.txt':
                loadedData = importDataXML(filename);
                accountMap = loadedData[0];
                transactions = loadedData[1];
                break;
            default:
                console.log('Invalid file type, please submit data in CSV, JSON or TXT (XML) format.')
                break;
        }
    } else if (command !== 'Exit') {
        console.log('Invalid command')
    }
} while (command !== 'Exit');




//CODE ARCHIVE

// function initialiseAccounts(transactions) {//creates empty database for the accounts, based on the transaction data
//     let accountMap = new Map();
//     for (let i = 0; i < transactions.length; i++) {
//         let source = transactions[i][1];
//         let target = transactions[i][2];
//         if (accountMap.get(source) === undefined) { //if new source name encountered, creates new account for them
//             accountMap.set(source, new Account());
//         }
//         if (accountMap.get(target) === undefined) { //if new target name encountered, creates new account for them
//             accountMap.set(target, new Account());
//         }
//     }
//     return accountMap
// }

// function populateAccounts(transactions, accountMap) {//populates the database
//     for (let i = 0; i < transactions.length; i++) {
//         let source = transactions[i][1];
//         let target = transactions[i][2];
//         let value = parseFloat(transactions[i][4]);
//         accountMap.get(source).balance -= value;
//         accountMap.get(source).transactions[accountMap.get(source).transactions.length] = i;
//         accountMap.get(target).balance += value;
//         accountMap.get(target).transactions[accountMap.get(target).transactions.length] = i;
//     }
//     return accountMap
// }

// function populateTransactions(transactions, accountMap, accountTransactions) {
//         /*Add the transaction number to the lists of transactions for the accounts.
//         The transaction number is the index of the transaction in the 'transactions' list*/
//     for (let i = 0; i < transactions.length; i++) {
//         let source = transactions[i][1];
//         let target = transactions[i][2];
//         accountTransactions[accountMap.get(source)][accountTransactions[accountMap.get(source)].length] = i;
//         accountTransactions[accountMap.get(target)][accountTransactions[accountMap.get(target)].length] = i;
//     }
//     return accountTransactions
// }

// if (commandCore === 'All') {
//     for (let key of accountMap.keys()) {
//         let output = key + ' ' + Math.round(accountMap.get(key).balance*100)/100; //collects name and rounded balance
//         console.log(output); //prints name and balance on new line
//     }
// } else if (accountMap.get(commandCore) === undefined) {
//     console.log('Invalid command or account name.'); //if command isn't All or a valid account name, error message
// } else {
//     let transacts = accountMap.get(commandCore).transactions; //get list of transaction #s for the account name
//     transacts.forEach(function(transactionID) { //iterate over each transaction #
//         let transaction = transactions[transactionID]; //get the list of properties for the specific transaction
//         let output = transaction.date + ' ' + transaction.narrative + ' ' + transaction.value; //suture them together for output
//         console.log(output);
//     })
// }

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

// let transactions = [];
// for (let i = 1; i < lines.length - 1; i++) {//iterate over lines, starting from the second line to avoid header row
//     transactions[i - 1] = readLine(lines[i]); //this could be replaced with a transaction class for more clarity later
// }
// return transactions

// let transactions = transactiondata.map(processTransaction);

//let filename = 'Transactions2014.csv';
// let filename = 'DodgyTransactions2015.csv';
//
//
// fs.readFile(filename, 'utf8', function(err, data) {
//     // if (err) throw err
//     if (data == undefined) {
//         logger.fatal('No data found at ' + filename);
//     } else  {
//         logger.info('loaded file: ' + filename);
//     }
//
//     let lines = splitLines(data); // splits the raw text into a list of lines
//     let transactiondata = processLines(lines); // converts each line into a list of column entries
//     let transactions = []
//     for (let i = 0; i < transactiondata.length; i++) {
//         transactions.push(processTransaction(transactiondata[i], i+1)) // converts lists of column entries into Transaction objects
//     }
//     let accountMap = initialiseAccounts(transactions); // creates an empty Map of account names to Account class objects
//     accountMap = populateAccounts(transactions, accountMap); // populates the Account objects with appropriate values
//
//     console.log('Please enter a command:'); //requests command from user
//     let command = readline.prompt(); //takes in command from user
//     // let command = 'List Jon A'
//     let commandCore = command.substr(5, command.length - 5); // extracts the variable part of the command
//     // Valid commands are of the form 'List [X]' where [X] is either 'All' or an account name. Only [X] need be kept.
//
//     if (commandCore === 'All') {
//         displayAll(accountMap)
//     } else if (accountMap.get(commandCore) === undefined) {
//         console.log('Invalid command or account name.'); //if command isn't All or a valid account name, error message
//     } else {
//         displayAccount(commandCore, accountMap, transactions)
//     }
// });

// fs.readFile(filename, 'utf8', function(err, data) {
//     logger.debug('CSV importer active')
//     if (data === undefined) {
//         logger.fatal('No data found at ' + filename);
//     } else  {
//         logger.info('loaded file: ' + filename);
//     }
//     let lines = splitLines(data); // splits the raw text into a list of lines
//     let transactiondata = processLines(lines); // converts each line into a list of column entries
//     let transactions = [];
//     for (let i = 0; i < transactiondata.length; i++) { // converts lists of column entries into Transaction objects
//         transactions.push(processTransaction(transactiondata[i], i+1))
//     }
//     let accountMap = initialiseAccounts(transactions); // creates an empty Map of account names to Account class objects
//     accountMap = populateAccounts(transactions, accountMap); // populates the Account objects with appropriate values
//
//     return [accountMap, transactions]
// })


// fs.readFile(filename, 'utf8', function(err,data) {
//     if (err) throw err
//     if (data === undefined) {
//         logger.fatal('No data found at ' + filename);
//     } else  {
//         logger.info('loaded file: ' + filename);
//     }
//
//     let entries = JSON.parse(data);
//     let transactions = processJSON(entries); //converts each JSON entry into a Transaction object
//     let accountMap = initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
//     accountMap = populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
//
//     return [accountMap, transactions]
// })
// return [accountMap, transactions]