import Blockly from 'blockly';


export const initGlobalBusinessPartnerBlock = () => {

	Blockly.Blocks['global_business_partner'] = {
		init: function() {
			this.appendDummyInput('BUSINESS_PARTNER').appendField('Business Partner')
			this.setOutput(true);
			this.setColour('#CA601A');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent the BP selected for the configuration. The returned value is an object.");
			this.setHelpUrl("");
		}
	};
}
