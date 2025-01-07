import Blockly from 'blockly';

export const initReturnBlock = () => {

	Blockly.Blocks['return'] = {
		init: function() {
			this.appendValueInput('RETURN').appendField('Return')
			this.setOutput(false, null);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour('#6917A0');
			this.setInputsInline(true);
			this.setTooltip("Use this block to return a value from a custom function");
			this.setHelpUrl("");
		}
	};


}
