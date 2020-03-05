const path = require('path');
const fs = require('fs-extra');
const handlebars = require('handlebars');
const minimatch = require('minimatch');

async function getPackageJSON(location) {
	if (!location) {
		location = process.cwd();
	}

	return readJson('package.json', location);
}

async function getTemplateConfig(location) {
	if (!location) {
		location = process.cwd();
	}

	let data;
	// Try vulcan.config.js first
	data = await readJsFile('vulcan.config.js', location);

	// Next is .vulcanrc
	if (!data) {
		data = await readJson('.vulcanrc', location);
	}

	if (!data) {
		const pkg = await readJson('package.json', location);
		if (!pkg) {
			return null;
		}

		data = pkg.vulcan;
	}

	return data;
}

async function writeTemplateConfig(data) {
	// Get data from config-template
	const templateConfig = await fs.promises.readFile(path.join(__dirname, '../res/config-template.js'), 'utf-8');
	const parsed = handlebars.compile(templateConfig)(data);

	await fs.promises.writeFile(path.join(process.cwd(), 'vulcan.config.js'), parsed, {flag: 'w'});
}

async function prependReadme(data) {
	// Get readme in directory
	const existingReadme = await fs.promises.readFile(path.join(process.cwd(), 'README.md'), {encoding: 'utf-8', flag: 'a+'});
	const forword = await fs.promises.readFile(path.join(__dirname, '../res/prepended-readme-template.md'), 'utf-8');
	const forwordParsed = handlebars.compile(forword)(data);
	const readme = forwordParsed + existingReadme;
	await fs.promises.writeFile(path.join(process.cwd(), 'README.md'), readme, {flag: 'w'});
}

async function readJsFile(filename, location) {
	const jsPath = path.join(location, filename);
	let data;
	try {
		data = require(jsPath);
	} catch (error) {
		if (error && error.code !== 'ENOENT') {
			return null;
		}
	}

	return data;
}

async function readJson(filename, location) {
	let data;
	try {
		data = await fs.promises.readFile(path.join(location, filename), 'utf-8');
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
		console.log(`Error trying to parse ${filename}`);
		console.error(error);
	}

	return data;
}

async function parseTemplateFiles(location, answers, config) {
	// Recursively read each of the files in this directory and insert handlebars
	await parseDirectory({baseLocation: location, currentPath: './', parsedPath: './'}, answers, config);
}

async function parseDirectory(pathInfo, answers, config) {
	// Check if this path has been white/blacklisted
	if (!includeTest(config, pathInfo.parsedPath)) {
		return;
	}

	const currentTemplateLocation = path.join(pathInfo.baseLocation, pathInfo.currentPath);
	const currentCopyLocation = path.join(process.cwd(), pathInfo.parsedPath);
	// Copy directory location over if it doesn't exist already
	try {
		await fs.promises.stat(currentCopyLocation);
		console.log(`Skipped: ${currentCopyLocation}`);
	} catch {
		// Create directory since it doesn't exist
		await fs.promises.mkdir(currentCopyLocation);
		console.log(`Created: ${currentCopyLocation}`);
	}

	// Read directory
	const files = await fs.promises.readdir(currentTemplateLocation);
	if (!files) {
		return;
	}

	// Loop through directory files
	files.forEach(async file => {
		const parsedFileName = handlebars.compile(file)(answers);
		// Check if file is white/blacklisted
		const filePath = path.join(pathInfo.currentPath, file);
		const parsedFilePath = path.join(pathInfo.parsedPath, parsedFileName);

		if (!includeTest(config, parsedFilePath)) {
			return;
		}

		const templateFileLocation = path.join(currentTemplateLocation, file);
		const lstat = await fs.promises.lstat(templateFileLocation);
		if (lstat.isDirectory()) {
			await parseDirectory({baseLocation: pathInfo.baseLocation, currentPath: filePath, parsedPath: parsedFilePath}, answers, config);
		} else if (lstat.isFile()) {
			const fileData = await fs.promises.readFile(templateFileLocation, 'utf-8');
			const template = handlebars.compile(fileData);
			const parsed = template(answers);

			// Create file in directory
			const copyLocation = path.join(process.cwd(), parsedFilePath);
			await fs.promises.writeFile(copyLocation, parsed, {flag: 'w'});
			console.log(`Copied: ${parsedFilePath}`);
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

module.exports = {
	getPackageJSON,
	getTemplateConfig,
	writeTemplateConfig,
	prependReadme,
	parseTemplateFiles,
	copyTemplateFiles
};
