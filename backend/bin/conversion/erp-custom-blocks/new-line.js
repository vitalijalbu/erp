import Blockly from 'blockly';


export const initNewLineBlock = () => {

	Blockly.Blocks['new_line'] = {
		init: function() {
			this.appendDummyInput('NewLine').appendField('new Line')
			this.setOutput(true);
			this.setColour('160');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip('Represent the New Line Char.');
			this.setHelpUrl("");
		}
	};
}
