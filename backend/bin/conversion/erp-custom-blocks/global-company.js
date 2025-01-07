import Blockly from 'blockly';


export const initGlobalCompanyBlock = () => {

	Blockly.Blocks['global_user_company'] = {
		init: function() {
			this.appendDummyInput('COMPANY').appendField('User Company')
			this.setOutput(true);
			this.setColour('#BBA906');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the company ID of the current logged in user");
			this.setHelpUrl("");
		}
	};


}
