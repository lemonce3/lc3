'use strict';

const FinderAdapter = {
	win32: require('./adapters/win32'),
	linux: require('./adapters/linux'),
	mac: require('./adapters/darwin')
};

module.exports = function BrowserInstallationFinder({ aliases, os }) {
	return FinderAdapter[os](aliases);
};