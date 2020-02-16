const path = require('path');
const fs = require('fs-extra');

async function getPackageJSON() {
	let data;
	try {
		data = await fs.promises.readFile(path.join(process.cwd(), 'package.json'), 'utf-8');
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

async function copyTemplateFiles(location) {
	await fs.copy(location, process.cwd());
}

module.exports = {getPackageJSON, copyTemplateFiles};
