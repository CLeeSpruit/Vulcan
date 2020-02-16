function deleteTemplate(tmplMan, templateName) {
	if (!templateName) {
		console.log('Error deleting template: No template provided.');
		return;
	}

	tmplMan.deleteTemplate(templateName);
	console.log(`Template ${templateName} successfully removed.`);
}

module.exports = deleteTemplate;
