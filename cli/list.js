function list(tmplMan) {
	console.log('Registered Templates:');
	console.log(Object.keys(tmplMan.getTemplates()).join('\n'));
}

function view(tmplMan, templateName) {
	const template = tmplMan.getTemplate(templateName);

	if (!template) {
		console.log(`No template found with name ${templateName}`);
		return;
	}

	console.log(template);
}

module.exports = {list, view};
