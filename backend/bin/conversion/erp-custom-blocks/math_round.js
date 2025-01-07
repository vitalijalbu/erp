import Blockly from "blockly";

export const initMathRoundBlock = () => {
	Blockly.Blocks["math_round"] = {
		itemCounter: 1,
		minInputs: 0,
		options: [],

		init: function () {
			this.appendValueInput("NUM")
				.setCheck("Number")
				.appendField(
					new Blockly.FieldDropdown([
						["round", "ROUND"],
						["round up", "ROUNDUP"],
						["round down", "ROUNDDOWN"],
						["round →", "toFixed"],
					]),
					"op"
				);
			this.setColour("%{BKY_MATH_HUE}");
			this.setInputsInline(false);
			this.setTooltip("Round a number up or down");
			this.setOutput(true, "Number");

			this.itemCount_ = this.minInputs;
		},

		/**
		 * Creates XML to represent number of text inputs.
		 * @returns {!Element} XML storage element.
		 * @this {Blockly.Block}
		 */
		mutationToDom: function () {
			const container = Blockly.utils.xml.createElement("mutation");
			container.setAttribute("items", this.itemCount_);
			return container;
		},
		/**
		 * Parses XML to restore the text inputs.
		 * @param {!Element} xmlElement XML storage element.
		 * @this {Blockly.Block}
		 */
		domToMutation: function (xmlElement) {
			const targetCount = parseInt(xmlElement.getAttribute("items"), 10);
			this.updateShape_(targetCount);
		},

		/**
		 * Returns the state of this block as a JSON serializable object.
		 * @returns {{itemCount: number}} The state of this block, ie the item count.
		 */
		saveExtraState: function () {
			// console.log(this.getField("Feature")?.textContent_)
			return {
				itemCount: this.itemCount_,
				type: this.getFieldValue('op')
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.updateShape_(state["itemCount"], state['type']);
		},
		/**
		 * Populate the mutator's dialog with this block's components.
		 * @param {!Blockly.Workspace} workspace Mutator's workspace.
		 * @return {!Blockly.Block} Root block in mutator.
		 * @this Blockly.Block
		 */
		// These are the decompose and compose functions for the lists_create_with block.
		decompose: function (workspace) {
			// This is a special sub-block that only gets created in the mutator UI.
			// It acts as our "top block"
			var topBlock = workspace.newBlock("lists_create_with_container");
			topBlock.initSvg();

			// Then we add one sub-block for each item in the list.
			var connection = topBlock.getInput("STACK").connection;
			for (var i = 0; i < this.itemCount_; i++) {
				var itemBlock = workspace.newBlock("lists_create_with_item");
				itemBlock.initSvg();
				connection.connect(itemBlock.previousConnection);
				connection = itemBlock.nextConnection;
			}

			// And finally we have to return the top-block.
			return topBlock;
		},

		// The container block is the top-block returned by decompose.
		compose: function (topBlock) {
			// First we get the first sub-block (which represents an input on our main block).
			var itemBlock = topBlock.getInputTargetBlock("STACK");

			// Then we collect up all of the connections of on our main block that are
			// referenced by our sub-blocks.
			// This relates to the saveConnections hook (explained below).
			var connections = [];
			while (itemBlock && !itemBlock.isInsertionMarker()) {
				// Ignore insertion markers!
				connections.push(itemBlock.valueConnection_);
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}

			// Then we disconnect any children where the sub-block associated with that
			// child has been deleted/removed from the stack.
			for (var i = 0; i < this.itemCount_; i++) {
				var connection = this.getInput('decimals').connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
			}

			// Then we update the shape of our block (removing or adding iputs as necessary).
			// `this` refers to the main block.
			// this.itemCount_ = connections.length;
			this.updateShape_(connections.length);
		},

		saveConnections: function (topBlock) {
			// First we get the first sub-block (which represents an input on our main block).
			var itemBlock = topBlock.getInputTargetBlock("STACK");

			// Then we go through and assign references to connections on our main block
			// (input.connection.targetConnection) to properties on our sub blocks
			// (itemBlock.valueConnection_).
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput('decimals');
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}
		},

		/**
		 * Adds inputs to the block until it reaches the target number of inputs.
		 * @param {number} targetCount The target number of inputs for the block.
		 * @this {Blockly.Block}
		 * @private
		 */
		updateShape_: function (targetCount, type = "") {
			while (this.itemCount_ < targetCount) {
				if (type === "toFixed") {
					this.appendValueInput("decimals").setCheck("Number").appendField("by");
					this.appendDummyInput("declabel").appendField("decimals");
					this.setInputsInline(true);
				}
				this.itemCount_++;
			}
			while (this.itemCount_ > targetCount) {
				this.itemCount_--;

				if (this.getInput("decimals")) {
					this.removeInput("decimals");
					this.removeInput("declabel");
					this.setInputsInline(false);
				}
			}
		},

		onchange: function (e) {
			if (
				e.type === Blockly.Events.BLOCK_CHANGE &&
				e.name === "op" &&
				e.blockId === this.id
			) {
				this.itemCounter = e.newValue == 'toFixed' ? 1 : 0;
				this.minInputs = this.itemCounter;

				this.updateShape_(e.newValue == 'toFixed' ? 1 : 0, e.newValue);
			}
		},
	};
};
