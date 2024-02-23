import Blockly from 'blockly';


export const initGlobalUserBlock = () => {

	Blockly.Blocks['global_user_id'] = {
		init: function() {
			this.appendDummyInput('USER').appendField('User')
			this.setOutput(true);
			this.setColour('#3537B4');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the current logged in user. The returned variable is an object");
			this.setHelpUrl("");
		}
	};
}
