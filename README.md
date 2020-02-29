[![Build Status](https://travis-ci.com/CassandraSpruit/Vulcan.svg?branch=master)](https://travis-ci.com/CassandraSpruit/Vulcan)
[![npm](https://img.shields.io/npm/v/@cspruit/vulcan)](https://www.npmjs.com/package/@cspruit/vulcan)
[![license](https://img.shields.io/github/license/CassandraSpruit/Vulcan)](https://github.com/CassandraSpruit/Vulcan/blob/master/LICENSE)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo) [![Greenkeeper badge](https://badges.greenkeeper.io/CassandraSpruit/Vulcan.svg)](https://greenkeeper.io/)

# Vulcan

⚒ A CLI boilerplate creator and manager

Easily set up and create any boilerplate code that can be uses multiple times for different projects.
 
## Installation
- Install by running ```npm install -g vulcan``` to install globally.

## Usage

### Creating a Template
In order to start generatating boilerplate code, a template needs to be created first. In a clean directory, stage any files that you want to use. Templating uses [Handlebars](https://handlebarsjs.com/). To call a field you just need to wrap it in {{ }}.

#### Example Templating for a README.md file
```
	# {{projectName}}
	## __{{description}}__
```

### Vulcan config
- **Name**
	- Required
	- Used to create and generate templates, so make it easy to remember and short
- **Fields**
	- Accepts values that will be used in the template
	- Field Properties:
		- description: (_string, required_), displays to the user during creation
		- type: (_string, default: 'string'_), type of question asked to the user. Accepted values: number, list, boolean, string
		- pattern: (_string_), requires input to match RegEx expression. **NOTE: Make sure to leave out the beginning and ending '/'**
		- patternDescription: (_string_), displays to the user if they fail to meet the pattern requirements
		- required: (_boolean_), required to create the template
	- Fields can also just take a string as a shortcut for { description: "some given string", type: string, required: false }
- **Ignore**
	- Accepts a list of [glob](https://en.wikipedia.org/wiki/Glob_(programming)) patterns to _not_ include in the template (aka blacklist)
	- node_modules, .git, package-lock.json not included by default.
- **Files**
	- Accepts a list of [glob](https://en.wikipedia.org/wiki/Glob_(programming)) patterns to exclusively include in the template (aka whitelist)
	- Files will be taken into account first, then the ignore property

#### Example Config
_Config settings can be separate in vulcan.config.js, .vulcanrc, or in as a field in package.json._

```json
	"vulcan": {
		"name": "cli-utility",
		"fields": {
			"pkg": {
				"description": "NPM package name",
				"type": "string",
				"pattern": "^[0-9a-z\\$\\-\\+\\!\\*\\'\\(\\)][0-9a-zA-Z\\$\\-\\_\\.\\+\\!\\*\\'\\(\\)]{0,213}$",
				"patternDescription": "Must match NPM naming scheme (alphanumeric, no spaces, cannot start with a . or _ or capital letter)",
				"required": true
			},
			"description": "Package description",
			"name": "Display name of package",
			"urlName": {
				"description": "URL name of package repo",
				"required": true
			}
		},
		"files": [
			"src",
			"assets",
		],
		"ignore": [
			"*.test.js"
		]
	}
```

## List of Vulcan Templates
- **[CLI Utility](https://github.com/CassandraSpruit/Vulcan-Cli-Utility)** : Generates a very basic node.js CLI utility app

## Contributing
All contributions, suggestions, and issues are welcome!

Check out the [Issues](https://github.com/CassandraSpruit/Vulcan/issues) page.

## License
This project uses [GPL 3.0](https://github.com/CassandraSpruit/Vulcan/blob/master/LICENSE).