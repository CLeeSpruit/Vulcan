const {writeTemplateConfig, prependReadme} = require('./files');

async function create(templateName) {
	// Generate a vulcan.config.js file
	await writeTemplateConfig({templateName});

	// Prepend "prepended-readme.md" to README.md or create if not exists
	await prependReadme({templateName});

	console.log(`Template ${templateName} created! Config is in vulcan.config.js and instructions on use are in README.md`);
}

module.exports = create;
