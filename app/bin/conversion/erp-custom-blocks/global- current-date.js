import Blockly from 'blockly';


export const initGlobalDateBlock = () => {

	Blockly.Blocks['global_current_date'] = {
		init: function() {
			this.appendDummyInput('DATE').appendField('Current Date')
			this.setOutput(true);
			this.setColour('#4B773E');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the current Date");
			this.setHelpUrl("");
		}
	};


}
