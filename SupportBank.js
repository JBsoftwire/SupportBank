const fs = require('fs');
const readline = require('readline-sync');
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
logger.trace('Initiating program');
const fileImport = require('./fileImport')
const display = require('./display')

// main code

let command;
let accountMap;
let transactions;

// MAIN COMMAND LOOP: valid commands are 'Import File [file]', 'List All', 'List [name]' and 'Exit'

do {
    console.log('Valid commands: \'Import File [filename]\', \'List All\', \'List [Name]\', \'Exit\'')
    console.log('Please enter command:');
    command = readline.prompt();
    if (command.substr(0,5) === 'List ' && accountMap !== undefined) {//if data has been successfully loaded, can operate on command
        let subcommand = command.substr(5, command.length - 5);
        switch (subcommand) {
            case 'All':
                display.displayAll(accountMap);
                break;
            default:
                if (accountMap.get(subcommand) === undefined) {
                    console.log('Invalid account name.'); //if command isn't All or a valid account name, error message
                } else {
                    display.displayAccount(subcommand, accountMap, transactions);
                }
                break;
        }
    } else if (command.substr(0,5) === 'List ' && accountMap === undefined) {
        console.log('Please import a file first.')
    } else if (command.substr(0,12) === 'Import File ') {
        let extension = /\.[a-zA-Z]+$/; // regex to find segments of form '.[alphabetic]' at the end of the line
        let filetype = command.substr(command.search(extension)); //finds index of file extension and extracts
        let filename = command.substr(12);
        switch (filetype) {
            case '.csv':
                [accountMap, transactions] = fileImport.importDataCSV(filename);
                break;
            case '.json':
                [accountMap, transactions] = fileImport.importDataJSON(filename);
                break;
            case '.txt':
                [accountMap, transactions] = fileImport.importDataXML(filename);
                break;
            default:
                console.log('Invalid file type, please submit data in CSV, JSON or TXT (XML) format.')
                break;
        }
    } else if (command !== 'Exit') {
        console.log('Invalid command')
    }
} while (command !== 'Exit');