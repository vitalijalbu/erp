import Blockly from "blockly";

export const initApplyPriceBlock = () => {
	Blockly.Blocks["apply_price"] = {
		itemCount_: 0,
		has_notes_: false,
		has_width_: false,
		has_min_price_: false,
		movable_block: null,
		init: function () {
			this.appendDummyInput("APPLY").appendField("Apply Product Price");
			this.appendValueInput("ITEM")
				.appendField("Item:		")
				.appendField(
					new Blockly.FieldDropdown([
						["ID     ", "0"],
						["Code", "1"],
					]),
					"option"
				);
			this.appendValueInput("QTY").appendField("Qty:");
			this.appendDummyInput("WIDTH")
				.appendField(new Blockly.FieldCheckbox(false), "has_width")
				.appendField("Width (optional):");
			this.appendDummyInput("MIN_PRICE")
				.appendField(new Blockly.FieldCheckbox(false), "has_min_price")
				.appendField("Min. Price (optional):");
			this.appendDummyInput("NOTES")
				.appendField(new Blockly.FieldCheckbox(false), "has_notes")
				.appendField("Notes (optional):");
			this.setOutput(true);
			this.setColour("#146191");
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(false);
			this.setTooltip("Enable Current Operation");
			this.setHelpUrl("");
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
			return {
				itemCount: this.itemCount_,
				has_notes: this.has_notes_,
				has_min_price: this.has_min_price_,
				has_width: this.has_width_,
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.has_min_price_ = state["has_min_price"];
			this.has_notes_ = state["has_notes"];
			this.has_width_ = state["has_width"];
			this.updateShape_(state["itemCount"]);
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
				var connection = this.getInput("ITEM").connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
				var connection = this.getInput("QTY").connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
				var connection = this.getInput("WIDTH").connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
				var connection = this.getInput("MIN_PRICE").connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
				var connection = this.getInput("NOTES").connection.targetConnection;
				if (connection && connections.indexOf(connection) == -1) {
					connection.disconnect();
				}
			}

			// Then we update the shape of our block (removing or adding iputs as necessary).
			// `this` refers to the main block.
			// this.itemCount_ = connections.length;
			this.updateShape_(connections.length);

			// Reconnect any child blocks.
			for (let i = 0; i < this.itemCount_; i++) {
				connections[i]?.reconnect(this, "ADD" + i);
			}
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
				var input = this.getInput("ITEM");
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput("QTY");
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput("WIDTH");
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput("MIN_PRICE");
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
			}
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput("NOTES");
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
		updateShape_: function (targetCount, eventName=null) {
			while (this.itemCount_ < targetCount) {
				if (eventName) {
					switch (eventName) {
						case "has_width":
							this.runModWitdh();
							break;
						case "has_min_price":
							this.runModMinPrice();
							break;
						case "has_notes":
							this.runModNotes();
							break;
						default:
							break;
					}
				}
				else {
					this.runModMinPrice()
					this.runModWitdh()
					this.runModNotes()
				}
				this.itemCount_++;
			}
			while (this.itemCount_ > targetCount) this.itemCount_--;
		},

		onchange: function (e) {
			if (
				e.blockId === this.id &&
				e.type === Blockly.Events.BLOCK_CHANGE &&
				e.element === "field" &&
				_.includes(["has_width", "has_min_price", "has_notes"], e.name)
			) {
				this[e.name + "_"] = e.newValue === "TRUE";
				this.updateShape_(this.itemCount_ + 1, e.name);
			}
		},

		saveConnectedBlock: async function (blockName) {
			let input = this.getInput(blockName);
			if (input) {
				let connection = input.connection?.targetConnection?.sourceBlock_;
				this.movable_block = connection;
			}
		},
		runModWitdh: function () {
			if (!this.has_width_ && this.getInput("WIDTH").type === Blockly.inputTypes.VALUE) {
				this.saveConnectedBlock("WIDTH")
					.then(() => {
						this.removeInput("WIDTH");
						this.appendDummyInput("WIDTH")
							.appendField(new Blockly.FieldCheckbox(this.has_width_), "has_width")
							.appendField("Width (optional):");
						this.moveInputBefore("WIDTH", "MIN_PRICE");
					})
					.then(() => this.movable_block?.moveBy(20, 0));
			} else if (this.has_width_) {
				this.removeInput("WIDTH");
				this.appendValueInput("WIDTH")
					.appendField(new Blockly.FieldCheckbox(this.has_width_), "has_width")
					.appendField("Width (optional):");
				this.moveInputBefore("WIDTH", "MIN_PRICE");
			}
		},
		runModMinPrice: function () {
			if (
				!this.has_min_price_ &&
				this.getInput("MIN_PRICE").type === Blockly.inputTypes.VALUE
			) {
				this.saveConnectedBlock("MIN_PRICE")
					.then(() => {
						this.removeInput("MIN_PRICE");
						this.appendDummyInput("MIN_PRICE")
							.appendField(
								new Blockly.FieldCheckbox(this.has_min_price_),
								"has_min_price"
							)
							.appendField("Min. Price (optional):");
						this.moveInputBefore("MIN_PRICE", "NOTES");
					})
					.then(() => this.movable_block?.moveBy(20, 0));
			} else if (this.has_min_price_) {
				this.removeInput("MIN_PRICE");
				this.appendValueInput("MIN_PRICE")
					.appendField(new Blockly.FieldCheckbox(this.has_min_price_), "has_min_price")
					.appendField("Min. Price (optional):");
				this.moveInputBefore("MIN_PRICE", "NOTES");
			}
		},
		runModNotes: function () {
			if (!this.has_notes_ && this.getInput("NOTES").type === Blockly.inputTypes.VALUE) {
				this.saveConnectedBlock("NOTES")
					.then(() => {
						this.removeInput("NOTES");
						this.appendDummyInput("NOTES")
							.appendField(new Blockly.FieldCheckbox(this.has_notes_), "has_notes")
							.appendField("Notes (optional):");
					})
					.then(() => this.movable_block?.moveBy(20, 0));
			} else if (this.has_notes_) {
				this.removeInput("NOTES");
				this.appendValueInput("NOTES")
					.appendField(new Blockly.FieldCheckbox(this.has_notes_), "has_notes")
					.appendField("Notes (optional):");
			}
		},
	};
};
