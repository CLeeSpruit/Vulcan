const {exec} = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const ora = require('ora');
const {folders} = require('./execute-config');

const cleanupAll = async spinner => {
	exec('vulcan clear');
	const cleanFolders = Object.values(folders);

	return Promise.all(cleanFolders.map(folder => cleanFolder(spinner, folder)));
};

const cleanFolder = async (spinner, folderName) => {
	spinner.text = `Cleaning ${folderName}`;
	await fs.remove(path.join(process.cwd(), folderName)).catch(error => {
		spinner.fail(`Error cleaning ${folderName}`);
		throw error;
	});
	spinner.succeed(`Cleaned: ${folderName}`);
};

const spinner = ora('Cleaning files').start();
cleanupAll(spinner).then(async () => {
	spinner.succeed();
}, error => {
	spinner.fail();
	return error;
});

module.exports = {cleanupAll};
