#!/usr/bin/env node
const meow = require('meow');
const vulcan = require('./vulcan.js');

const cli = meow(`
	Usage
		$ vulcan <command>

	Examples
		$ vulcan generate
		-- Generates a generic boiler plate code
`, {
	flags: {
		interact: {
			type: 'boolean',
			default: true,
			alias: 'i'
		},
		config: {
			type: 'string',
			default: '',
			alias: 'c'
		}
	}
});

vulcan(cli);
