const path = require('path');
const {exec} = require('child_process');
const ora = require('ora');
const fs = require('fs-extra');
const git = require('nodegit');

const registerRepo = 'cli-utility';
const generateTestFolder = 'generate-from-list';
const generateUrlTestFolder = 'generate-from-url';
const templateUrl = 'https://github.com/CassandraSpruit/Vulcan-CLI-Utility';

const cleanupAll = async spinner => {
	exec('vulcan clear', printToConsole);
	const folders = [registerRepo, generateTestFolder, generateUrlTestFolder];

	return Promise.all(folders.map(folder => cleanFolder(spinner, folder)));
};

const cleanFolder = async (spinner, folderName) => {
	spinner.text = `Cleaning ${folderName}`;
	await fs.remove(path.join(process.cwd(), folderName)).catch(error => {
		spinner.fail(`Error cleaning ${folderName}`);
		throw error;
	});
	spinner.succeed(`Cleaned: ${folderName}`);
};

const runTest = async (spinner, testLabel, test) => {
	spinner.text = `Test: ${testLabel}`;
	try {
		await test();
		spinner.succeed(`Success: ${testLabel}`);
	} catch (error) {
		spinner.fail(`Error: ${testLabel}`);
		throw error;
	}
};

const printToConsole = (error, stdout, stderr) => {
	if (error) {
		throw error;
	}

	if (stdout) {
		console.log(stdout);
	}

	if (stderr) {
		console.log(stderr);
	}
};

const register = async () => {
	await git.Clone(templateUrl, registerRepo);
	await exec(`cd ${registerRepo} && vulcan register ${registerRepo} && cd ../`, printToConsole);
};

const list = async () => {
	await exec('vulcan list', printToConsole);
};

const view = async () => {
	await exec(`vulcan view ${registerRepo}`, printToConsole);
};

const generate = async () => {
	await exec(`mkdir ${generateTestFolder} && cd ${generateTestFolder} && vulcan generate --no-interact ${registerRepo} && cd ../`, printToConsole);
};

const generateUrl = async () => {
	await exec(`mkdir ${generateUrlTestFolder} && cd ${generateUrlTestFolder} && vulcan generate --no-interact ${templateUrl} && cd ../`, printToConsole);
};

/** *** Start! *****/
const spinner = ora('Running tests').start();
// Make everything clean before we mess it up
spinner.text = 'Cleaning testing space';
cleanupAll(spinner).then(async () => {
	await runTest(spinner, 'cmd: Register', register);
	await runTest(spinner, 'cmd: List', list);
	await runTest(spinner, 'cmd: View', view);
	await runTest(spinner, 'cmd: Generate - List', generate);
	await runTest(spinner, 'cmd: Generate - URL', generateUrl);
	spinner.succeed('Tests have run, doing final cleanup...');
	// await cleanupAll(spinner);
}, error => {
	return error;
});
