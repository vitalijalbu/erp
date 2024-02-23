import Blockly from 'blockly';


export const initGlobalProcessBlock = () => {

	Blockly.Blocks['global_current_process'] = {
		init: function() {
			this.appendDummyInput('PROCESS').appendField('Current Process')
			this.setOutput(true);
			this.setColour('#4B773E');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the current process");
			this.setHelpUrl("");
		}
	};


}
