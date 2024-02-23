import Blockly from 'blockly';


export const initGlobalCurrentRowQty = () => {

	Blockly.Blocks['global_current_row_qty'] = {
		init: function() {
			this.appendDummyInput('QTY').appendField('Current Row Qty')
			this.setOutput(true);
			this.setColour('#4B773E');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the current order row qty");
			this.setHelpUrl("");
		}
	};


}
