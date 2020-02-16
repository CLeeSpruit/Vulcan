const Storage = require('configstore');

class TemplateManager {
	constructor() {
		this.storage = new Storage('vulcan');
		this.templateKey = 'template-list';
	}

	getTemplates() {
		const templates = this.storage.get(this.templateKey);
		if (templates) {
			return templates;
		}

		return {};
	}

	createTemplate(template) {
		if (!this.storage.has(`${this.templateKey}.${template.name}`)) {
			this.storage.set(`${this.templateKey}.${template.name}`, template);
		}
	}

	hasTemplate(templateName) {
		return this.storage.has(`${this.templateKey}.${templateName}`);
	}

	deleteTemplate(template) {
		this.storage.delete(`${this.templateKey}.${template.name}`);
	}
}

module.exports = TemplateManager;
