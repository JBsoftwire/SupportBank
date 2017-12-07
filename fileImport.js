// import functions
const fs = require('fs');
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
const xml2js = require('xml2js')
let parser = xml2js.Parser()
const processData = require('./processData')
const database = require('./database')

function importDataCSV(filename) {
    logger.debug('Entered CSV reader')
    let data = fs.readFileSync(filename, 'utf8')
    if (data === undefined) {
        logger.fatal('No data found at ' + filename);
    } else {
        logger.info('loaded file: ' + filename);
    }
    let lines = processData.splitLines(data); // splits the raw text into an array of lines
    let transactiondata = processData.processLines(lines); // converts each line into an array of column entries
    let transactions = processData.processCSV(transactiondata); //converts the array of trans. data into an array of Transaction objects
    let accountMap = database.initialiseAccounts(transactions); // creates an empty Map of account names to Account class objects
    accountMap = database.populateAccounts(transactions, accountMap); // populates the Account objects with appropriate values
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
    let transactions = processData.processJSON(entries); //converts each JSON entry into a Transaction object
    let accountMap = database.initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
    accountMap = database.populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
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
    let transactions = processData.processXML(entries);
    let accountMap = database.initialiseAccounts(transactions); //creates an empty Map of account names to Account class objects
    accountMap = database.populateAccounts(transactions, accountMap); //populates the Account objects with appropriate values
    return [accountMap, transactions]
}

module.exports = {importDataCSV, importDataJSON, importDataXML}