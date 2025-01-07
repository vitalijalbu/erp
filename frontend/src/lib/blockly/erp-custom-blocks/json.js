import Blockly from 'blockly';

export const initJsonBlock = () => {

	Blockly.Blocks['json'] = {
		init: function() {
			this.appendDummyInput('JSON')
				.appendField('JSON')
			this.appendDummyInput('TEXTAREA')
				.appendField(new Blockly.FieldMultilineInput(
					'Insert here your json', 
					Blockly.FieldTextInputValidator), 'Block'
				)
			this.setOutput(true);
			this.setColour('#56AD4B');
			this.setTooltip("Convert a JSON string into a variable");
			this.setHelpUrl("");
		
		}
	};

}
