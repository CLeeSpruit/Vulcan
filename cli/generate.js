const url = require('url');
const path = require('path');
const ora = require('ora');
const inquirer = require('inquirer');
const git = require('isomorphic-git');
const http = require('isomorphic-git/http/node');
const fs = require('fs-extra');
const defaultConfig = require('../res/default-config');
const {getTemplateConfig, parseTemplateFiles, readFile} = require('./files');

async function generate(tmplMan, templateName, flags) {
	// Check if this has already been generated
	const tmpl = await getTemplateConfig();
	if (tmpl) {
		// Ask user if they want to overwrite
		if (flags.interact) {
			const confirm = await inquirer.prompt([
				{
					name: 'config',
					message: 'Vulcan config detected. This will overwrite existing files. Do you want to continue?',
					type: 'confirm'
				}
			]);
			if (!confirm || !confirm.config) {
				console.log('Error generating template: vulcan template already generated. Use "link" or "update" command instead.');
				return;
			}
		} else {
			console.log('Warning: Vulcan config detected. This will overwrite existing files.');
		}
	}

	// Check if templateName is url
	const isUrl = detectUrl(templateName);
	if (isUrl) {
		// Generate from URL
		const temporaryFolderName = 'vulcan-temp';
		const spinner = ora(`Fetching repo at ${templateName}`).start();
		try {
			await git.clone({
				fs, 
				http, 
				url: templateName,
				proxy: 'https://cors.isomorphic-git.org',
				dir: '/' + temporaryFolderName,
				singleBranch: true,
				depth: 1,
				noCheckout: true,
				noTags: true
			});
			spinner.succeed(`Repo found, adding to temporary folder "${temporaryFolderName}"`);
		} catch (error) {
			spinner.fail(`Error generating template from url ${templateName}`);
			throw error;
		}

		// Grab config from folder
		const temporaryFolderLocation = path.join(process.cwd(), temporaryFolderName);
		await generateTemplateFiles(temporaryFolderLocation, flags);

		// Cleanup temp folder
		await fs.remove(temporaryFolderLocation);
	} else {
		// Generate from template list
		const template = tmplMan.getTemplate(templateName);
		if (!template) {
			console.log(`Error generating template: No template found with name ${templateName}`);
			return;
		}

		return generateTemplateFiles(template.location, flags);
	}
}

async function generateTemplateFiles(location, flags) {
	// Fill in the blanks set by the template
	const templateConfig = {...defaultConfig, ...await getTemplateConfig(location)};

	const userConfigLocation = flags.config;
	let userConfigAnswers = {};
	if (userConfigLocation) {
		const userConfig = await readFile(process.cwd(), userConfigLocation);
		if (!userConfig) {
			console.log('Error generating template: Given config file not found.');
			return;
		}

		userConfigAnswers = userConfig.boilerplate;
	}

	const answers = await getAnswers(templateConfig.fields, userConfigAnswers, flags.interact);
	if (!flags.interact && templateConfig.fields !== {}) {
		console.log(`Warning: ${templateConfig.name} has fields that are not set.`);
	}

	// Copy files into current directory and parse them
	await parseTemplateFiles(location, answers, templateConfig);

	console.log(`${templateConfig.name} successfully created. Happy coding!`);
}

function detectUrl(stringUrl) {
	try {
		const parsedUrl = new url.URL(stringUrl);
		return Boolean(parsedUrl);
	} catch {
		return false;
	}
}

async function getAnswers(data, presetAnswers, interactiveMode) {
	let answers = {};
	const questions = Object.entries(data).map(entry => {
		const key = entry[0];
		const properties = entry[1];

		// Check if this hasn't been answered already
		if (presetAnswers) {
			const answer = presetAnswers[key];
			if (answer) {
				answers[key] = answer;
				return null;
			}
		}

		if (interactiveMode) {
			return createQuestion(key, properties);
		}

		return null;
	}).filter(question => question);

	// Ask user questions
	const inputAnswers = questions.length > 1 ? await inquirer.prompt(questions) : {};
	answers = {...answers, ...inputAnswers};
	return answers;
}

function createQuestion(key, properties) {
	const question = {
		name: key,
		message: properties.description || properties
	};

	if (properties.type) {
		switch (properties.type) {
			case 'number':
				question.type = 'number';
				break;
			case 'list':
				question.type = 'list';
				question.choices = properties.choices;
				break;
			case 'boolean':
				question.type = 'list';
				question.choices = ['true', 'false'];
				break;
			case 'string':
				question.type = 'input';
				break;
			default:
				question.type = 'input';
		}
	}

	let conditionFn = () => true;
	if (properties.pattern) {
		const pattern = new RegExp(properties.pattern);
		conditionFn = value => {
			const match = value.match(pattern);
			if (!match) {
				const message = properties.patternDescription || 'Field does not match pattern.';
				console.log('\n' + message);
				return false;
			}

			return true;
		};
	}

	if (properties.required) {
		const previous = conditionFn;
		conditionFn = value => {
			if (!value) {
				console.log('\nField is required.');
				return false;
			}

			return previous(value);
		};
	}

	if (conditionFn) {
		question.validate = conditionFn;
	}

	return question;
}

module.exports = generate;
