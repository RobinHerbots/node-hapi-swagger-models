module.exports = function (type, urlRoot, modelName, model, scriptModel, scriptValidation, scriptObjectModel) {
	for (var i = 0; i < scriptObjectModel.length; i++) {
		var objModel = scriptObjectModel[i];
		// name/val/type
		var name = objModel.name;
		var val = objModel.val;
		var oType = objModel["type"];

		// ts type
		switch (oType) {
			case "string":
				break;
			case "boolean":
				break;
			case "array":
				oType = "any[]";
				break;
			case "integer":
				oType = "number";
				break;
			default:
				oType = "any";
				break;
		}

		scriptModel[i] = `      ${name}: ${oType};`;
	}

	return [
		'export interface ' + modelName.replace(/[\[\],]/g, "") + ' {',
		scriptModel.join('\n'),
		'};'
	];
};