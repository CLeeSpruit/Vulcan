const {getPackageJSON} = require('./package');

async function register(tmplMan) {
	const pkgJson = await getPackageJSON();

	if (!pkgJson) {
		console.log('Error registering template: No package.json found!');
		return;
	}

	const config = pkgJson.vulcan;
	if (!config) {
		console.log('Error registering template: Vulcan config not found in package.json.');
		return;
	}

	const templateName = config.name;
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
	console.log(template);
}

module.exports = register;
