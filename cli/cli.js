#!/usr/bin/env node
const meow = require('meow');
const vulcan = require('./vulcan.js');

const cli = meow(`
	Usage
		$ vulcan <command>

	Examples
		$ vulcan generate
		-- Generates a generic boiler plate code
`);

vulcan(cli);
