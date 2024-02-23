import Blockly from 'blockly';

export const initCommentBlock = () => {

	Blockly.Blocks['comment'] = {
		init: function() {
			this.appendDummyInput('COMMENT')
				.appendField('Comment:')
			this.appendDummyInput('TEXTAREA')
				.appendField(new Blockly.FieldMultilineInput(
					'Insert Comment here    ', 
					Blockly.FieldTextInputValidator), 'Block'
				)
			this.setOutput(false);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setColour('#56AD4B');
			this.setTooltip("Comment");
			this.setHelpUrl("");
		}
	};	
}
