var swaggerClient = require("swagger-client"),
	util = require("util"),
	Promise = require("bluebird"),
	fs = require("fs"),
	sep = require('path').sep;


var config = {
	fileOutput: null,
	filePrefix: "",
	api: null,
	format: 'backbone'
};

module.exports = function (options) {
	return new Promise(function (resolve, reject) {
		Object.keys(options).forEach(function (k) {
			if (config[k] !== undefined) {
				config[k] = options[k];
			}
		});

		if (!config.api) {
			reject('API Url Endpoint required');
		}

		if (!config.fileOutput) {
			reject('File output path required');
		}

		var format;
		if (typeof config.format === 'function') {
			format = config.format;
		} else {
			try {
				format = require("./formatters/" + config.format + ".js");
			} catch (e) {
				format = require("./formatters/vanilla.js");
			}
		}

		config.fileOutput = process.cwd() + sep + config.fileOutput;
		if (!fs.existsSync(config.fileOutput)) {
			fs.mkdirSync(config.fileOutput);
		}
		//disable TLS check
		process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = "0"
		swaggerClient(config.api).then(function (swagger) {
			var model,
				modelName,
				property,
				propertyName,
				scriptModel,
				scriptValidation;
			for (modelName in swagger.spec.definitions) {
				if (swagger.spec.definitions.hasOwnProperty(modelName)) {
					model = swagger.spec.definitions[modelName];
					scriptModel = [];
					scriptObjectModel = []; // added for prop name, type, and value
					scriptValidation = [];
					for (propertyName in model.properties) {
						if (model.properties.hasOwnProperty(propertyName)) {
							property = model.properties[propertyName];
							if (scriptModel.length > 0) {
								scriptModel[scriptModel.length - 1] += ',';
							}
							var defaultValue;
							if (property.default === undefined) {
								switch (property.type) {
									case "string":
										defaultValue = null;
										break;
									case "boolean":
										defaultValue = false;
										break;
									case "array":
										defaultValue = "[]";
										break;
									case "integer":
										defaultValue = 0;
										break;
									default:
										defaultValue = null;
								}
							} else {
								defaultValue = property.type === "string" ? util.format('\'%s\'', property.default) : property.default;
							}

							scriptObjectModel.push({'name': propertyName, 'val': defaultValue, 'type': property.type});
							scriptModel.push(util.format('           %s: %s', propertyName, defaultValue));
							if (property.required) {
								scriptValidation.push.apply(scriptValidation, [
									util.format('           if (!attrs.%s) {', property.name),
									util.format('               return \'Please fill %s field.\';', property.name),
									'           }'
								]);
							}
						}
					}


					var fileExt = config.format.indexOf("typescript") !== -1 ? ".ts" : ".js";

					var modelScript = format(config.format, "/", config.filePrefix + modelName, model, scriptModel, scriptValidation, scriptObjectModel);
					fs.writeFileSync(config.fileOutput + sep + config.filePrefix + modelName.replace(/[\[\],]/g, "").toLowerCase() + fileExt, modelScript.join('\n'));
				}
			}
			resolve("Done.");
		}).catch(function (error) {
			reject("Swagger API Call failed " + error);

		});
	});
};