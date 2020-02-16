const path = require('path');
const {promises: fs} = require('fs');

async function getPackageJSON() {
	let data;
	try {
		data = await fs.readFile(path.join(process.cwd(), 'package.json'), 'utf-8');
	} catch (error) {
		if (error && error.code !== 'ENOENT') {
			return null;
		}
	}

	try {
		return JSON.parse(data);
	} catch (error) {
		console.log('Error trying to parse package.json');
		console.error(error);
	}
}

module.exports = {getPackageJSON};
