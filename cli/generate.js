function generate(tmplMan, templateName) {
	const template = tmplMan.getTemplate(templateName);

	if (!template) {
		console.log('Error generating template: No template found with name', templateName);
		return;
	}

	console.log(`Generating ${templateName}...`);
}

module.exports = generate;
