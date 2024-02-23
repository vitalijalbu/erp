import Blockly from 'blockly';

export const initPairValueBlock = () => {

	Blockly.Blocks['pair_value'] = {
		init: function() {
			this.appendDummyInput('Name')
				.appendField('Key')
				.appendField(new Blockly.FieldTextInput('', Blockly.FieldTextInputValidator), 'NAME')
			this.appendDummyInput('FreeInput')
				.appendField(" => ")
			this.appendValueInput('Value')
				.appendField("Value")
			this.setOutput(true, ["pair_value", null]);
			this.setColour('#A09217');
			this.setInputsInline(true);
			this.setTooltip("This block represent a single key => value element of a array");
			this.setHelpUrl("");
		}
	};
}
