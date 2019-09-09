module.exports = function (type, urlRoot, modelName, model, scriptModel, scriptValidation) {
    var normalizedName = modelName.replace(/[\[\],]/g, ""),
        modelTemplate = [
            '   var Backbone = require("backbone");',
            '   var ' + normalizedName + ' = Backbone.Model.extend({',
            '       urlRoot: \'' + urlRoot + '\','];
    if (model['x-key'])
        modelTemplate.push('       idAttribute : \'' + model['x-key'].toLowerCase() + '\',');
    else modelTemplate.push('       idAttribute : \'id\',');

    modelTemplate = modelTemplate.concat([
        '       defaults: {',
        scriptModel.join('\n'),
        '       },',
        '       validate: function (attrs) {',
        scriptValidation.join('\n'),
        '       }',
        '   });',
        '   module.exports = ' + normalizedName + ';'
    ]);

    return modelTemplate;
};