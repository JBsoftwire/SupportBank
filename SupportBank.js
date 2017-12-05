let fs = require('fs');
//let parse = require('csv-parse');

function splitLines(data) {//splits the raw csv input into an array of lines
    return data.split('\n');
}

function readLine(line) {//splits a line into an array of column entries
    return line.split([',']);
}

function processLines(lines) {//the function to process each line
    let transactions = [];
    for (let i = 1; i < lines.length; i++) {//iterate over lines, starting from the second line to avoid header row
        transactions[i-1] = readLine(lines[i]);
    }
    return transactions
}

fs.readFile('Transactions2014.csv', 'utf8',function(err,data){
    class Account {
        constructor(balance) {
            this.balance = balance;
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

    let lines = splitLines(data);
    let transactions = processLines(lines);

    console.log(transactions);

});

/*plan for the program:
* 1. load csv file
* 2. for each line:
* 2.1. create accounts if nonexistent
* 2.2. perform credit and debit operations
* 2.3. create transaction
* 2.4. add transaction key to
* */