const TemplateManager = require('./template-manager');
const create = require('./create');
const deleteTemplate = require('./delete');
const generate = require('./generate');
const updateTemplate = require('./update-template');
const update = require('./update');
const register = require('./register');
const linkTemplate = require('./link');

function vulcan(cli) {
	const command = cli.input[0];
	const templateName = cli.input[1];
	const tmplMan = new TemplateManager();

	switch (command) {
		case 'generate':
			if (!templateName) {
				return cli.showHelp();
			}

			if (cli.pkg) {
				console.log('Error generating template: package.json already exists.');
			}

			return generate(tmplMan, templateName);
		case 'register':
			return register(tmplMan, cli.pkg);
		case 'create':
			return create(tmplMan, templateName);
		case 'delete':
			return deleteTemplate(tmplMan, templateName);
		case 'link':
			return linkTemplate(tmplMan, cli.pkg, templateName);
		case 'list':
			console.log('Registered Templates:');
			console.log(Object.keys(tmplMan.getTemplates()).join('\n'));
			break;
		case 'update':
			if (templateName) {
				return updateTemplate(tmplMan, templateName);
			}

			return update();
		default:
			return cli.showHelp();
	}
}

module.exports = vulcan;
