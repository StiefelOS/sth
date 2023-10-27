// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('sth.generateInputOutput', () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		let documentText = "";
		try {
			//@ts-expect-error
			documentText = vscode.window.activeTextEditor.document.getText();
		} catch (e) {
			vscode.window.showInformationMessage('No file opened');
		}

		if (!documentText) {
			return;
		}

		const searchStringInput: string = "$input.";
		const searchStringOutput: string = "$output.";
		const threeLineSpacer: string = "\n\n\n";
		const beginOfScriptText: string = "/**\n*BEGIN OF SCRIPT\n*/";
		const endOfScriptText: string = "/**\n*END OF SCRIPT\n*/";
		let beginScriptString: string = "";
		let endScriptString: string = "";


		/**
		 * handle Input Variables
		 */

		let resultInput = getIndex(documentText, searchStringInput);
		beginScriptString = "$input = " + JSON.stringify(buildInputObject(documentText, resultInput, searchStringInput)) + threeLineSpacer;


		/**
		 * handle output Variables
		 */

		let resultOutput = getIndex(documentText, searchStringOutput);
		beginScriptString += "$output = " + JSON.stringify(buildInputObject(documentText, resultOutput, searchStringOutput)) + threeLineSpacer + beginOfScriptText + threeLineSpacer;

		/**
		 * build end script string;
		 */

		endScriptString = threeLineSpacer + endOfScriptText + buildOuputLog(documentText, resultOutput, searchStringOutput);

		const editor = vscode.window.activeTextEditor;
		if (editor) {
			editor.edit(editBuilder => {
				editBuilder.delete(new vscode.Range(0, 0, 99999, 999));
				editBuilder.insert(new vscode.Position(0, 0), beginScriptString + documentText + endScriptString);
			});
		}



		/**
		 * All vaiable fetched. Building input object.
		 */

	});

	context.subscriptions.push(disposable);
}

const getIndex = function (documentText: String, searchString: String) {
	let result = [];
	for (let i = 0; i < documentText.length; ++i) {
		if (documentText.substring(i, i + searchString.length) === searchString) {
			result.push(i);
		}
	}

	return result;
};

const buildInputObject = function (documentText: String, indexArray: Array<number>, searchString: String) {
	let returnObject = {};

	indexArray.forEach(item => {
		let variableBegin = item + searchString.length;
		let regex = new RegExp("[A-Za-z0-9]");
		let variable = "";

		for (let i = variableBegin; i < documentText.length; ++i) {
			if (regex.test(documentText.substring(i, i + 1))) {
				variable += documentText.substring(i, i + 1);
			} else {
				//@ts-expect-error
				returnObject[variable] = "";
				break;
			}
		}
	});

	return returnObject;

};

const buildOuputLog = function (documentText: String, indexArray: Array<number>, searchString: String) {
	let output: String = "";
	let outputArray: Array<string> = [];
	const consoleLogStart = "console.log(\"";
	const consoleLogEnd = ");";

	indexArray.forEach(item => {
		let variableBegin = item + searchString.length;
		let regex = new RegExp("[A-Za-z0-9]");
		let variable = "";

		for (let i = variableBegin; i < documentText.length; ++i) {
			if (regex.test(documentText.substring(i, i + 1))) {
				variable += documentText.substring(i, i + 1);
			} else {
				outputArray.push(variable);
				break;
			}
		}
	});

	//remove duplicates in array
	outputArray = [...new Set(outputArray)];
	//build output string with condensed array
	outputArray.forEach(item => {
		output += "\n" + consoleLogStart + item + ": \"" + " + " + searchString + item + consoleLogEnd;
	});


	return output;
};

// This method is called when your extension is deactivated
export function deactivate() { }
