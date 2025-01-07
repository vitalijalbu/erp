import Blockly from 'blockly';


export const initGlobalStandardProduct = () => {

	Blockly.Blocks['global_st_product'] = {
		init: function() {
			this.appendDummyInput('StandProduct').appendField('Current Standard Product')
			this.setOutput(true);
			this.setColour('#3537B4');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the current standard product. The returned variable is an object");
			this.setHelpUrl("");
		}
	};
}
