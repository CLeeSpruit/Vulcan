const {getPackageJSON, copyTemplateFiles} = require('./files');

async function generate(tmplMan, templateName) {
	const template = tmplMan.getTemplate(templateName);
	if (!template) {
		console.log('Error generating template: No template found with name', templateName);
		return;
	}

	const pkg = await getPackageJSON();
	if (pkg) {
		console.log('Error generating template: package.json already exists. Use "link" command instead.');
		return;
	}

	await copyTemplateFiles(template.location);
	console.log(`Generating ${templateName}...`);
}

module.exports = generate;
