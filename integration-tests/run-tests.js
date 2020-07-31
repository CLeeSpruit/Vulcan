const {exec} = require('child_process');
const ora = require('ora');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs-extra');
const {cleanupAll} = require('./clean');
const {folders} = require('./execute-config');

const configPath = '../integration-tests/existing-config.js';
const templateUrl = 'https://github.com/CassandraSpruit/Vulcan-CLI-Utility';

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
	const folderLocation = './integration-tests/' + folders.registerRepo;
	await fs.mkdirp(folderLocation);
	await git.clone({
		fs,
		http,
		url: templateUrl,
		// TODO: Replace this as this proxy is only meant for testing
		corsProxy: 'https://cors.isomorphic-git.org',
		dir: folderLocation,
		singleBranch: true,
		depth: 1,
		noCheckout: true,
		noTags: true
	});
	await exec(`cd ${folderLocation} && vulcan register ${folders.registerRepo} && cd ../`, printToConsole);
};

const list = async () => {
	await exec('vulcan list', printToConsole);
};

const view = async () => {
	await exec(`vulcan view ${folders.registerRepo}`, printToConsole);
};

const generate = async () => {
	await exec(`mkdir ${folders.generateTestFolder} && cd ${folders.generateTestFolder} && vulcan generate --no-interact ${folders.registerRepo} && cd ../`, printToConsole);
};

const generateUrl = async () => {
	await exec(`mkdir ${folders.generateUrlTestFolder} && cd ${folders.generateUrlTestFolder} && vulcan generate --no-interact ${templateUrl} && cd ../`, printToConsole);
};

const generateWithConfig = async () => {
	await exec(`mkdir ${folders.generateWithConfigFolder} && cd ${folders.generateWithConfigFolder} && vulcan generate --no-interact --config=${configPath} ${folders.registerRepo} && cd ../`, printToConsole);
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
	await runTest(spinner, 'cmd: Generate - Config', generateWithConfig);
	spinner.succeed('Tests have run, doing final cleanup...');
	// Await cleanupAll(spinner);
}, error => {
	return error;
});
