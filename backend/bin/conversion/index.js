#!/usr/bin/env node

import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';
import functionConverter from './function-converter.js';
import constraintConverter from './constraint-converter.js';


yargs(hideBin(process.argv))
    .command('convert-function <json> [out]', 'convert a user defined function', (yargs) => {
        return yargs
            .positional('json', {
                describe: 'json representing the custom function entity',
            })
            .positional('out', {
                describe: 'output file where saving generated function. if omitted the generated code will be sent to stdout',
                default: null
            })
    }, (argv) => {
        functionConverter(JSON.parse(argv.json), argv.out);
    })
    .command('convert-constraint <json> [out]', 'convert a constraint', (yargs) => {
        return yargs
            .positional('json', {
                describe: 'json representing the constraint entity',
            })
            .positional('out', {
                describe: 'output file where saving generated function. if omitted the generated code will be sent to stdout',
                default: null
            })
    }, (argv) => {
        constraintConverter(JSON.parse(argv.json), argv.out);
    })
    .parse();