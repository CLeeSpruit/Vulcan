const {getTemplates} = require('./template-manager');

function generate(templateName) {
	const templates = getTemplates();
	const template = templates.find(tmpl => tmpl.pkg === templateName);

	if (!template) {
		console.log('No template found with name', templateName);
		return;
	}

	console.log('Generating', templateName);
}

module.exports = generate;
