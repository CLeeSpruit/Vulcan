const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');

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

async function parseTemplateFiles(location, answers) {
	// Recursively read each of the files in this directory and insert handlebars
	await parseDirectory(location, './', answers);
}

async function parseDirectory(baseLocation, currentPath, answers) {
	const currentTemplateLocation = path.join(baseLocation, currentPath);
	const currentCopyLocation = path.join(process.cwd(), currentPath);
	// Copy directory location over if it doesn't exist already
	try {
		await fs.promises.stat(currentCopyLocation);
		console.log(`Skipped: ${currentPath}`);
	} catch {
		// Create directory since it doesn't exist
		await fs.promises.mkdir(currentCopyLocation);
		console.log(`Created: ${currentPath}`);
	}

	// Read directory
	const files = await fs.promises.readdir(currentTemplateLocation);
	if (!files) {
		return;
	}

	// Loop through directory files
	files.forEach(async file => {
		const fileLocation = path.join(currentTemplateLocation, file);
		const filePath = path.join(currentPath, file);
		const lstat = await fs.promises.lstat(fileLocation);
		if (lstat.isDirectory()) {
			await parseDirectory(baseLocation, filePath, answers);
		} else if (lstat.isFile()) {
			const fileData = await fs.promises.readFile(fileLocation, 'utf-8');
			const template = handlebars.compile(fileData);
			const parsed = template(answers);

			// Create file in directory
			const copyLocation = path.join(process.cwd(), filePath);
			await fs.promises.writeFile(copyLocation, parsed, {flag: 'w'});
			console.log(`Copied: ${filePath}`);
		}
	});
}

async function copyTemplateFiles(location) {
	await fs.copy(location, process.cwd());
}

module.exports = {getPackageJSON, parseTemplateFiles, copyTemplateFiles};
