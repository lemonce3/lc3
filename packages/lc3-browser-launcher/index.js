'use strict';

const os = require('os');
const debug = require('debug')('lc3:browserlauncher');
const Duck = require('@or-change/duck');

const normalize = require('./src/normalize');

const Browser = {
	Finder: require('./src/BrowserFinder'),
	Opener: require('./src/BrowserOpener'),
	ALIASES: require('./src/aliases')
};

module.exports = async function BrowserAgent(options) {
	debug('Lemonce3 browser launcher started.');
	
	const Utils = {};

	Duck({
		id: 'com.orchange.lc3.browserLauncher',
		injection: {
			aliases: Browser.ALIASES,
			os: os.platform()
		}
	}, ({ Browser, injection }) => {
		Utils.getInstallations = Browser.Finder(injection);
		Utils.open = Browser.Opener(injection);
	});
	
	debug('Searching installed browsers.');

	const installedBrowsers = await Utils.getInstallations();
	const installedBrowserNameList = Object.keys(installedBrowsers);

	if (installedBrowserNameList.length === 0) {
		throw new Error('No available browser installed.');
	}
	
	const finalOptions = normalize(options);

	debug('Find the first matching browser.');
	
	const browser = {
		name: null,
		info: null,
		running: false,
		process: null
	};

	finalOptions.browserPriority.find(alias => {
		const matchedInfo = installedBrowsers[alias];

		if (matchedInfo) {
			browser.name = alias;
			browser.info = matchedInfo;

			return true;
		}

		return false;
	});

	if (browser.info === null) {
		throw new Error('No matched browser installed in the mechine.');
	}

	debug('Launcher ready.');

	return {
		open(url) {
			const browserProcess = browser.process = Utils.open(url);

			browser.running = true;
			browserProcess.on('exit', () => browser.running = false);

			return this;
		},
		close() {
			browser.process.kill();

			return this;
		},
		getProcess() {
			return browser.process;
		}
	};
};