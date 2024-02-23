import Blockly from "blockly";

export const initEnableCurrentOp = () => {
	Blockly.Blocks["enable_current_op"] = {
		init: function () {
			this.appendDummyInput("OP").appendField("Enable Current Operation");
			this.appendValueInput("QTY").appendField("Quantity:");
			this.appendValueInput("NOTES").appendField("Notes:");
			this.setOutput(true);
			this.setColour("#B46835");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(false);
			this.setTooltip("Enable Current Operation");
			this.setHelpUrl("");
		},
	};
};
