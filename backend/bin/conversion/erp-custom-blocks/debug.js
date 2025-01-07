import Blockly from 'blockly';


export const initDebugBlock = () => {

	Blockly.Blocks['debug'] = {
		init: function() {
			this.appendValueInput('DEBUG').appendField('Debug')
			this.appendDummyInput().appendField('Comment').appendField(new Blockly.FieldTextInput('', Blockly.FieldTextInputValidator), 'COMMENT');
			this.setOutput(false, null);
			this.setColour('#B44435');
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(true);
			this.setHelpUrl("");
			this.setTooltip(`Print debug info for the given input. Input can be any type of variable.`);
		}
	};

}
