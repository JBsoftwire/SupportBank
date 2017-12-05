let fs = require('fs');
//let parse = require('csv-parse');

function splitlines(data) {
    data.split('$') //needs multiline flag to be set to true - how does that work?
}

function readline(line) {
    line.split([','])
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

});

/*plan for the program:
* 1. load csv file
* 2. for each line:
* 2.1. create accounts if nonexistent
* 2.2. perform credit and debit operations
* 2.3. create transaction
* 2.4. add transaction key to
* */