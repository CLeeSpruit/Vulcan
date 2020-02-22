const path = require('path');
const fs = require('fs-extra');

async function getPackageJSON(location) {
	if (!location) {
		location = process.cwd();
	}

	let data;
	try {
		data = await fs.promises.readFile(path.join(location, 'package.json'), 'utf-8');
	} catch (error) {
		if (error && error.code !== 'ENOENT') {
			return null;
		}
	}

	try {
		if (data) {
			return JSON.parse(data);
		}
	} catch (error) {
		console.log('Error trying to parse package.json');
		console.error(error);
	}
}

async function parseTemplateFiles() {
	//
}

async function copyTemplateFiles(location) {
	await fs.copy(location, process.cwd());
}

module.exports = {getPackageJSON, copyTemplateFiles};
