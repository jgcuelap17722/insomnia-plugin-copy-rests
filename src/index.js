const {
  quicktype,
  InputData,
  jsonInputForTargetLanguage,
} = require("quicktype-core");
const fs = require('fs')

async function quicktypeJSON(targetLanguage, typeName, jsonString) {
  const jsonInput = jsonInputForTargetLanguage(targetLanguage);
  await jsonInput.addSource({
    name: typeName,
    samples: [jsonString],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInput);

  return await quicktype({
    inputData,
    lang: targetLanguage,
    rendererOptions: {
      'just-types': true,
      'runtime-typecheck': false
    }
  });
}

async function main(language, mainName, jsonSchemaString) {
  const { lines: interfaces } = await quicktypeJSON(
    language,
    mainName,
    jsonSchemaString,
  );
  const result = interfaces.join("\n");
  return result
}

module.exports.requestActions = [
  {
    label: 'Copy interfaces Typescript',
    action: async (context, data) => {
      const { app: { alert }, network: { sendRequest }, store: { setItem } } = context;
      const { request } = data;
      const response = await context.network.sendRequest(request);
      if (!response.bodyPath) {
        alert('', 'there was an error in the request check the request!');
        return;
      }

      try {
        const body = fs.readFileSync(response.bodyPath);
        const responseConvert = await main("ts", "main", body)
        navigator.clipboard.writeText(responseConvert).then(() => {
          alert('Success!', 'Copied interfaces check your clipboard!');
        }, () => {
          alert('', 'There was a problem copying the interfaces, please try again');
        });
      } catch (e) {
        alert('', 'There was a problem copying the interfaces, please try again');
        return;
      }
    },
    icon: "fa-clone",
  },
];