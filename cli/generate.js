const url = require('url');
const path = require('path');
const inquirer = require('inquirer');
const git = require('nodegit');
const ora = require('ora');
const fs = require('fs-extra');
const defaultConfig = require('../res/default-config');
const {getTemplateConfig, parseTemplateFiles} = require('./files');

async function generate(tmplMan, templateName, flags) {
	// Check if this has already been generated
	const tmpl = await getTemplateConfig();
	if (tmpl) {
		console.log('Error generating template: vulcan tempalte already generated. Use "link" or "update" command instead.');
		return;
	}

	// Check if templateName is url
	const isUrl = detectUrl(templateName);
	if (isUrl) {
		// Generate from URL
		const tempFolderName = 'vulcan-temp';
		const spinner = ora(`Fetching repo at ${templateName}`).start();
		try {
			await git.Clone(templateName, tempFolderName);
			spinner.succeed(`Repo found, adding to temporary folder "${tempFolderName}"`);
		} catch (error) {
			spinner.fail(`Error generating template from url ${templateName}`);
			throw error;
		}

		// Grab config from folder
		const tempFolderLocation = path.join(process.cwd(), tempFolderName);
		await generateTemplateFiles(tempFolderLocation);

		// Cleanup temp folder
		await fs.remove(tempFolderLocation);
	} else {
		// Generate from template list
		const template = tmplMan.getTemplate(templateName);
		if (!template) {
			console.log(`Error generating template: No template found with name ${templateName}`);
			return;
		}

		const askQuestions = flags.interact;
		return generateTemplateFiles(template.location, askQuestions);
	}
}

async function generateTemplateFiles(location, askQuestions) {
	// Fill in the blanks set by the template
	const templateConfig = await getTemplateConfig(location);
	const config = {...defaultConfig, ...templateConfig};

	const answers = askQuestions ? await interactiveMode(config.fields) || {} : {};
	if (!askQuestions && config.fields !== {}) {
		console.warn(`Warning: ${templateConfig.name} has fields that are not set.`);
	}

	// Copy files into current directory and parse them
	await parseTemplateFiles(location, answers, config);

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

async function interactiveMode(data) {
	const questions = Object.entries(data).map(entry => {
		const key = entry[0];
		const properties = entry[1];
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
	});

	// Ask user questions
	const answers = await inquirer.prompt(questions);
	return answers;
}

module.exports = generate;
