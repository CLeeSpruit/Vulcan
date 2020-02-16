function register(tmplMan, pkgJson) {
	if (!pkgJson) {
		console.log('Error registering template: No package.json found!');
		return;
	}

	const templateName = pkgJson.name;
	if (tmplMan.hasTemplate(templateName)) {
		console.log(`Error registering template: Template with name ${templateName} already exists.`);
		return;
	}

	// Create template from json
	const template = {
		name: pkgJson.name
	};

	tmplMan.createTemplate(template);
	console.log(`Template ${templateName} registered successfully!`);
}

module.exports = register;
