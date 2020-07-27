const {exec} = require('child_process');
const ora = require('ora');
const gitClone = require('nodegit').Clone;
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
	await gitClone(templateUrl, folders.registerRepo);
	await exec(`cd ${folders.registerRepo} && vulcan register ${folders.registerRepo} && cd ../`, printToConsole);
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
