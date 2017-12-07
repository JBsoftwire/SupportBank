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

// database functions

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

module.exports = {initialiseAccounts, populateAccounts}