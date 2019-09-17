'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('debug')('lc3:browserlauncher');
const Duck = require('@or-change/duck');
const ALIASES = require('./aliases');

const RUNCOM_PATH = path.resolve('.lemoncerc.json');
const RUNCOM_SCHEMA = {
	type: 'array',
	items: {
		type: 'string',
		enum: Object.keys(ALIASES)
	}
};

const runcom = {};

function isRuncomExisted() {
	try {
		fs.accessSync(RUNCOM_PATH);

		return true;
	} catch (error) {
		return false;
	}
}

debug('Trying to find and parse .lemoncerc.json.');

if (isRuncomExisted()) {
	debug('The `.lemoncerc.json` is found.');

	try {
		const fallback = JSON.parse(fs.readFileSync(RUNCOM_PATH, 'utf-8'));

		Duck.Validator(RUNCOM_SCHEMA)(fallback);

		if (fallback && fallback.length > 0) {
			runcom.fallback = fallback;
		} else {
			runcom.fallback = ['chrome', 'firefox', 'ie'];
		}
	} catch (error) {
		throw new Error('The `.lemoncerc.json` parsing failed.\n\n' + error.message);
	}
} else {
	debug('No `.lemoncerc.json` found in cwd.');
}

module.exports = Duck.Normalizer({
	defaults: () => ({}),
	handler: options => {
		const finalOptions = {
			fallback: runcom.fallback
		};
	
		const {
			fallback: _fallback = finalOptions.fallback
		} = options;
	
		finalOptions.fallback = _fallback;
	
		return finalOptions;
	},
	validate: Duck.Validator({
		type: 'object',
		properties: {
			fallback: RUNCOM_SCHEMA
		}
	})
});