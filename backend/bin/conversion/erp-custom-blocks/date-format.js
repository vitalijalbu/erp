import Blockly from 'blockly';


export const initDateFormatBlock = () => {

	Blockly.Blocks['date_format'] = {
		init: function() {
			this.appendValueInput('DATE').appendField('Current Date')
			this.appendDummyInput('FORMAT').appendField('Format').appendField(new Blockly.FieldTextInput('Y-m-d'), 'Format')
			this.setOutput(true);
			this.setColour('#414883');
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setInputsInline(true);
			this.setTooltip("Represent Date with Php Format");
			this.setHelpUrl("");
		}
	};


}
