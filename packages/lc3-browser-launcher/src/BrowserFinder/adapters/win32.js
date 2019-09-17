'use strict';

// Find installations for different platforms
async function addInstallation(installations, name, instPath) {
	var fileExists = await exists(instPath);

	if (fileExists) {
		Object.keys(ALIASES).some(alias => {
			var {
				nameRe,
				cmd,
				macOpenCmdTemplate,
				path
			} = ALIASES[alias];

			if (nameRe.test(name)) {
				installations[alias] = {
					path: path || instPath,
					cmd,
					macOpenCmdTemplate
				};
				return true;
			}

			return false;
		});
	}
}

async function detectMicrosoftEdge() {
	var regKey = 'HKCU\\Software\\Classes\\ActivatableClasses';
	var stdout = await execWinShellUtf8(`@echo off & reg query ${regKey} /s /f MicrosoftEdge /k && echo SUCCESS || echo FAIL`);

	return /SUCCESS/.test(stdout) ? ALIASES['edge'] : null;
}

async function searchInRegistry(registryRoot) {
	var installations = {};
	var regKey = registryRoot + '\\SOFTWARE\\Clients\\StartMenuInternet';
	var regKeyEsc = regKey.replace(/\\/g, '\\\\');
	var browserRe = new RegExp(regKeyEsc + '\\\\([^\\\\]+)\\\\shell\\\\open\\\\command' +
		'\\s+(?:\\([^)]+\\)|<.*?>)\\s+reg_sz\\s+([^\n]+)\n', 'gi');

	// NOTE: To get the correct result regardless of the Windows localization,
	// we need to run the command using the UTF-8 codepage.
	var stdout = await execWinShellUtf8(`reg query ${regKey} /s`);

	for (var match = browserRe.exec(stdout); match; match = browserRe.exec(stdout)) {
		var name = match[1].replace(/\.exe$/gi, '');

		var path = match[2]
			.replace(/"/g, '')
			.replace(/\\$/, '')
			.replace(/\s*$/, '');

		await addInstallation(installations, name, path);
	}

	return installations;
}