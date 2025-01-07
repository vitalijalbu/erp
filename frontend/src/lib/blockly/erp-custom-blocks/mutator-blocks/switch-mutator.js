import Blockly from 'blockly'

export const initSwitchMutator = () => {

	Blockly.Blocks['control_case'] = {
		init: function() {
			this.setStyle('logic_blocks');
		  this.appendDummyInput()
			  .appendField('switch');
		  this.appendStatementInput('STACK');
		  this.setTooltip('--Placeholder--');
		  this.contextMenu = false;
		}
	  };
	  
	  Blockly.Blocks['case'] = {
		init: function() {
			this.setStyle('logic_blocks');
		  this.appendDummyInput()
			  .appendField('Case');
		  this.setPreviousStatement(true);
		  this.setNextStatement(true);
		  this.setTooltip('--Placeholder--');
		  this.contextMenu = false;
		}
	  };
	  
	  Blockly.Blocks['case_default'] = {
		init: function() {
			this.setStyle('logic_blocks');
			this.appendDummyInput()
				.appendField('Default');
			this.setPreviousStatement(true);
			this.setNextStatement(false);
			this.setTooltip('This function will run if there aren\'t any matching cases.');
			this.contextMenu = false;
		}
	  };
	
}