let fs = require('fs');
//let parse = require('csv-parse');
class Account {
    constructor(balance, transacts) {
        this.balance = balance;
        this.transacts = transacts;
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
        transactions[i-1] = readLine(lines[i]);
    }
    return transactions
}

function initialiseAccounts(transactions) {//creates empty database for the accounts, based on the transaction data
    let accountMap = new Map();
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i][1];
        let target = transactions[i][2];
        if (accountMap.get(source) === undefined) { //if new source name encountered, creates new account for them
            accountMap.set(source, new Account(0, []));
        }
        if (accountMap.get(target) === undefined) { //if new target name encountered, creates new account for them
            accountMap.set(target, new Account(0, []));
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
        accountMap.get(source).transacts[accountMap.get(source).transacts.length] = i
        accountMap.get(target).balance += value;
        accountMap.get(target).transacts[accountMap.get(target).transacts.length] = i
    }
    return accountMap
}

function populateTransacts(transactions, accountMap, accountTransacts) {
        //add the transaction number to the lists of transactions for the accounts
    for (let i = 0; i < transactions.length; i++) {
        let source = transactions[i][1];
        let target = transactions[i][2];
        accountTransacts[accountMap.get(source)][accountTransacts[accountMap.get(source)].length] = i;
        accountTransacts[accountMap.get(target)][accountTransacts[accountMap.get(target)].length] = i;
    }
    return accountTransacts
}

fs.readFile('Transactions2014.csv', 'utf8',function(err,data){

    let lines = splitLines(data);
    let transactions = processLines(lines);
    let accountMap = initialiseAccounts(transactions)
    accountMap = populateAccounts(transactions, accountMap)

    console.log(accountMap)

});

/*plan for the program:
* 1. load csv file
* 2. for each line:
* 2.1. create accounts if nonexistent
* 2.2. perform credit and debit operations
* 2.3. create transaction
* 2.4. add transaction key to
* */

//CODE DUSTBIN
/*
class Account {
    constructor(balance) {
        this.balance = balance;
    }
}

class Transaction {//do I actually need this?
    constructor(date, source, target, narrative, amount) {
        this.date = date;
        this.source = source;
        this.target = target;
        this.narrative = narrative;
        this.amount = amount;
    }
}*/

/*
let accountMap = new Map();
let accountTransact = [];
let maxAccountNum = 0;
let accounts = []

for (let i = 0; i < transactions.length; i++) {
    let source = transactions[i][1];
    let target = transactions[i][2];
    let value = parseFloat(transactions[i][3]);
    if(accountMap.get(source) === undefined) { //if new source name encountered, creates new account for them
        accountMap.set(source, maxAccountNum);
        accounts[accountMap.get(source)] = 0;
        accountTransact[accountMap.get(source)] = []; //creates an empty transaction list for that account
        maxAccountNum++;
    }
    if(accountMap.get(target) === undefined) { //if new target name encountered, creates new account for them
        accountMap.set(target, maxAccountNum);
        accounts[accountMap.get(source)] = 0;
        accountTransact[accountMap.get(target)] = []; //creates an empty transaction list for that account
        maxAccountNum++;
    }
    accounts[accountMap.get(source)] -= value; //decrements source balance by value of transaction
    accounts[accountMap.get(target)] += value; //increments target balance by value of transaction
    accountTransact[accountMap.get(source)][accountTransact[accountMap.get(source)].length] = i;
    accountTransact[accountMap.get(target)][accountTransact[accountMap.get(target)].length] = i;
    // these two lines add the transaction number to the list of transactions for each involved account
}
*/

//let balances = []
//let accountTransacts = [];
//let maxAccountNum = 0;

//balances[accountMap.get(source)] = 0; //initialises the account's balance at zero
//accountTransacts[accountMap.get(source)] = []; //creates an empty transaction list for that account
//maxAccountNum++;

// balances[accountMap.get(source)] = 0; //initialises the account's balance at zero
// accountTransacts[accountMap.get(target)] = []; //creates an empty transaction list for that account
// maxAccountNum++;

//balances[accountMap.get(source)] -= value; //decrements source balance by value of transaction
//balances[accountMap.get(target)] += value; //increments target balance by value of transaction

//let accountMap = initials[0];
//let balances = initials[1];
//let accountTransacts = initials[1]
//balances = populateBalances(transactions, accountMap, balances)
//accountTransacts = populateTransacts(transactions, accountMap, accountTransacts)