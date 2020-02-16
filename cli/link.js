function link(tmplMan, pkg, templateName) {
	if (!pkg) {
		console.log('Error linking template: No package.json found. Use "generate" command instead.');
		return;
	}

	if (!templateName) {
		console.log('Error linking template: Need to provide template name.');
		return;
	}

	const template = tmplMan.getTemplate(templateName);
	if (!template) {
		console.log('Error linking template: No template found with name', templateName);
		return;
	}

	console.log(`Linking ${templateName}...`);
}

module.exports = link;
