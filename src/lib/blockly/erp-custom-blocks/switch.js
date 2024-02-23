import Blockly from "blockly";

export const initSwitch = () => {
	Blockly.Blocks["switch"] = {
		caseCount_ : 0,
		defaultCount_: 0,
		
		init: function () {
			this.setPreviousStatement(true);
			this.setNextStatement(true);
			this.appendValueInput("SWITCH").appendField("Switch");
			this.appendValueInput("CASE0").appendField("Case");
			this.appendStatementInput("DO0").appendField("Do");
			this.setStyle('logic_blocks');
			this.setTooltip(
				"Does something if the condition is true. If there isn't a matching case the default function will be executed."
			);
			this.addIcon(new Blockly.icons.MutatorIcon(["case", "case_default"], this));
			// this.caseCount_ = 0;
			// this.defaultCount_ = 0;
		},

		mutationToDom: function () {
			if (!this.caseCount_ && !this.defaultCount_) {
				return null;
			}
			const container = Blockly.utils.xml.createElement('mutation');
			if (this.caseCount_) {
				container.setAttribute("case", this.caseCount_);
			}
			if (this.defaultCount_) {
				container.setAttribute("default", 1);
			}
			return container;
		},

		domToMutation: function (xmlElement) {
			this.caseCount_ = parseInt(xmlElement.getAttribute("case"), 10);
			this.defaultCount_ = parseInt(xmlElement.getAttribute("default"), 10);
			for (var i = 1; i <= this.caseCount_; i++) {
				this.appendValueInput("CASE" + i).appendField("Case");
				this.appendStatementInput("DO" + i).appendField("do");
			}
			if (this.defaultCount_) {
				this.appendStatementInput("DEFAULT").appendField("default");
			}
		},



		decompose: function (workspace) {
			var containerBlock = workspace.newBlock("control_case");
			containerBlock.initSvg();
			console.log(containerBlock.getInput("STACK"))
			var connection = containerBlock.getInput("STACK").connection;
			for (var i = 1; i <= this.caseCount_; i++) {
				var caseBlock = workspace.newBlock("case");
				caseBlock.initSvg();
				connection.connect(caseBlock.previousConnection);
				connection = caseBlock.nextConnection;
			}
			if (this.defaultCount_) {
				var defaultBlock = workspace.newBlock("case_default");
				defaultBlock.initSvg();
				connection.connect(defaultBlock.previousConnection);
			}
			return containerBlock;
		},

		compose: function (containerBlock) {
			//Disconnect all input blocks and remove all inputs.
			if (this.defaultCount_) {
				this.removeInput("DEFAULT");
			}
			this.defaultCount_ = 0;
			for (var i = this.caseCount_; i > 0; i--) {
				this.removeInput("CASE" + i);
				this.removeInput("DO" + i);
			}
			this.caseCount_ = 0;
			var caseBlock = containerBlock.getInputTargetBlock("STACK");
			while (caseBlock) {
				switch (caseBlock.type) {
					case "case":
						this.caseCount_++;
						var caseconditionInput = this.appendValueInput(
							"CASE" + this.caseCount_
						).appendField("Case");
						var caseInput = this.appendStatementInput(
							"DO" + this.caseCount_
						).appendField("Do");
						if (caseBlock.valueConnection_) {
							caseconditionInput.connection.connect(caseBlock.valueConnection_);
						}
						if (caseBlock.statementConnection_) {
							caseInput.connection.connect(caseBlock.statementConnection_);
						}
						break;
					case "case_default":
						this.defaultCount_++;
						var defaultInput =
							this.appendStatementInput("DEFAULT").appendField("Default");
						if (caseBlock.statementConnection_) {
							defaultInput.connection.connect(caseBlock.statementConnection_);
						}
						break;
					default:
						throw "Unknown block type.";
				}
				caseBlock = caseBlock.nextConnection && caseBlock.nextConnection.targetBlock();
			}
		},

		saveConnections: function (containerBlock) {
			var caseBlock = containerBlock.getInputTargetBlock("STACK");
			var i = 1;
			while (caseBlock) {
				switch (caseBlock.type) {
					case "case":
						var caseconditionInput = this.getInput("CASE" + i);
						var caseInput = this.getInput("DO" + i);
						caseBlock.valueConnection_ =
							caseconditionInput && caseconditionInput.connection.targetConnection;
						caseBlock.statementConnection_ =
							caseInput && caseInput.connection.targetConnection;
						i++;
						break;
					case "case_default":
						var defaultInput = this.getInput("DEFAULT");
						caseBlock.satementConnection_ =
							defaultInput && defaultInput.connection.targetConnection;
						break;
					default:
						throw "Unknown block type";
				}
				caseBlock = caseBlock.nextConnection && caseBlock.nextConnection.targetBlock();
			}
		},

		// updateShape_: function(targetCount) {

		// }
	};
};
