import Blockly from 'blockly';

export const initShowMessageBlock = () => {

	Blockly.Blocks['show_message'] = {
		init: function() {
			this.appendDummyInput('MESSAGE')
				.appendField('SHOW MESSAGE')
			this.appendDummyInput('TEXTAREA')
				.appendField(new Blockly.FieldMultilineInput(
					'Insert here your message    ', 
					Blockly.FieldTextInputValidator), 'Message'
				)
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(false);
			this.setOutput(true);
			this.setColour(70);
			this.setTooltip("Show a message tho the user");
			this.setHelpUrl("");
			
		}
	};
	
}
