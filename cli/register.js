const {getTemplateConfig} = require('./files');

async function register(tmplMan) {
	const config = await getTemplateConfig();

	if (!config) {
		console.log('Error registering template: No config found!');
		return;
	}

	const templateName = config.name;
	if (!templateName) {
		console.log('Error registering template: No "name" field found in config.');
		return;
	}

	if (tmplMan.hasTemplate(templateName)) {
		console.log(`Error registering template: Template with name ${templateName} already exists.`);
		return;
	}

	// Create template from json
	const template = {
		name: templateName,
		location: process.cwd()
	};

	tmplMan.createTemplate(template);
	console.log(`Template ${templateName} registered successfully!`);
}

module.exports = register;
