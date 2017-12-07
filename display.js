// output functions
const moment = require('moment-msdate')

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
        try {
            output = transaction.date.format('ll') + ' ' + transaction.source + ' ' + transaction.target + ' ' + transaction.narrative;
        }
        catch (dateerror) {
            output = transaction.date + ' ' + transaction.source + ' ' + transaction.target + ' ' + transaction.narrative;
        }
        // suture together transaction description
        // with date converted to legible format
        // and then add value based on if debit or credit
        if (transaction.source === name) {
            output += ' ' + -transaction.value;
        } else {
            output += ' ' + transaction.value;
        }
        console.log(output)
    })
}

module.exports = {displayAll, displayAccount}