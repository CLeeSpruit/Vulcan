const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const minimatch = require('minimatch');

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

async function parseTemplateFiles(location, answers, config) {
	// Recursively read each of the files in this directory and insert handlebars
	await parseDirectory(location, './', answers, config);
}

async function parseDirectory(baseLocation, currentPath, answers, config) {
	// Check if this path has been white/blacklisted
	if (!includeTest(config, currentPath)) {
		return;
	}

	const currentTemplateLocation = path.join(baseLocation, currentPath);
	const currentCopyLocation = path.join(process.cwd(), currentPath);
	const parsedCurrentCopyLocation = handlebars.compile(currentCopyLocation)(answers);
	// Copy directory location over if it doesn't exist already
	try {
		await fs.promises.stat(parsedCurrentCopyLocation);
		console.log(`Skipped: ${parsedCurrentCopyLocation}`);
	} catch {
		// Create directory since it doesn't exist
		await fs.promises.mkdir(parsedCurrentCopyLocation);
		console.log(`Created: ${parsedCurrentCopyLocation}`);
	}

	// Read directory
	const files = await fs.promises.readdir(currentTemplateLocation);
	if (!files) {
		return;
	}

	// Loop through directory files
	files.forEach(async file => {
		// Check if file is white/blacklisted
		const filePath = path.join(currentPath, file);
		if (!includeTest(config, filePath)) {
			return;
		}

		const fileLocation = path.join(currentTemplateLocation, file);
		const lstat = await fs.promises.lstat(fileLocation);
		if (lstat.isDirectory()) {
			await parseDirectory(baseLocation, filePath, answers, config);
		} else if (lstat.isFile()) {
			const fileData = await fs.promises.readFile(fileLocation, 'utf-8');
			const template = handlebars.compile(fileData);
			const parsed = template(answers);

			// Create file in directory
			const copyLocation = path.join(process.cwd(), filePath);
			const parsedCopyLocation = handlebars.compile(copyLocation)(answers);
			await fs.promises.writeFile(parsedCopyLocation, parsed, {flag: 'w'});
			console.log(`Copied: ${filePath}`);
		}
	});
}

function includeTest(config, path) {
	const filesList = config.files;
	const ignoreList = config.ignore;

	if (filesList) {
		const found = filesList.find(filesListGlob => minimatch(path, filesListGlob, {matchBase: true}));
		if (!found) {
			return false;
		}

		const ignore = ignoreList.find(ignoreGlob => minimatch(ignoreGlob, path, {matchBase: true}));
		if (ignore) {
			return false;
		}

		return true;
	}

	if (ignoreList) {
		const ignore = ignoreList.find(ignoreGlob => minimatch(ignoreGlob, path, {matchBase: true}));
		if (ignore) {
			return false;
		}

		return true;
	}

	return true;
}

async function copyTemplateFiles(location) {
	await fs.copy(location, process.cwd());
}

module.exports = {getPackageJSON, parseTemplateFiles, copyTemplateFiles};
