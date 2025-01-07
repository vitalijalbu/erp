import Blockly from 'blockly';

export const initRunCmd = () => {

	Blockly.Blocks['run_cmd'] = {
		/**
	 * Counter for the next input to add to this block.
	 * @type {number}
	 */
		inputCounter: 1,
		/**
		 * Minimum number of inputs for this block.
		 * @type {number}
		 */
		minInputs: 0,
		/**
		 * Block for creating a list with any number of elements of any type.
		 * @this Blockly.Block
		 */
		init: function () {
			this.appendDummyInput()
				.appendField('Run CMD')
				.appendField(new Blockly.FieldTextInput('', Blockly.FieldTextInputValidator), 'CMD')
			this.appendDummyInput().appendField('Params')

			this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
			this.setStyle('list_blocks');
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(true);
			this.setOutput(true);
			this.setColour('#390768');
			this.setTooltip(Blockly.Msg['LISTS_CREATE_WITH_TOOLTIP']);

			this.addIcon(new Blockly.icons.MutatorIcon(['lists_create_with_item'], this));
			this.itemCount_ = this.minInputs;
			this.updateShape_(1)
		},

		/**
		 * Creates XML to represent number of text inputs.
		 * @returns {!Element} XML storage element.
		 * @this {Blockly.Block}
		 */
		mutationToDom: function () {
			const container = Blockly.utils.xml.createElement('mutation');
			container.setAttribute('items', this.itemCount_);
			return container;
		},
		/**
		 * Parses XML to restore the text inputs.
		 * @param {!Element} xmlElement XML storage element.
		 * @this {Blockly.Block}
		 */
		domToMutation: function (xmlElement) {
			const targetCount = parseInt(xmlElement.getAttribute('items'), 10);
			this.updateShape_(targetCount);
		},

		/**
		 * Returns the state of this block as a JSON serializable object.
		 * @returns {{itemCount: number}} The state of this block, ie the item count.
		 */
		saveExtraState: function () {
			return {
				'itemCount': this.itemCount_,
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.updateShape_(state['itemCount']);
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
			var topBlock = workspace.newBlock('lists_create_with_container');
			topBlock.initSvg();

			// Then we add one sub-block for each item in the list.
			var connection = topBlock.getInput('STACK').connection;
			for (var i = 0; i < this.itemCount_; i++) {
				var itemBlock = workspace.newBlock('lists_create_with_item');
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
			var itemBlock = topBlock.getInputTargetBlock('STACK');

			// Then we collect up all of the connections of on our main block that are
			// referenced by our sub-blocks.
			// This relates to the saveConnections hook (explained below).
			var connections = [];
			while (itemBlock && !itemBlock.isInsertionMarker()) {  // Ignore insertion markers!
				connections.push(itemBlock.valueConnection_);
				itemBlock = itemBlock.nextConnection &&
					itemBlock.nextConnection.targetBlock();
			}

			// Then we disconnect any children where the sub-block associated with that
			// child has been deleted/removed from the stack.
			for (var i = 0; i < this.itemCount_; i++) {
				var connection = this.getInput('ADD' + i).connection.targetConnection;
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
			var itemBlock = topBlock.getInputTargetBlock('STACK');

			// Then we go through and assign references to connections on our main block
			// (input.connection.targetConnection) to properties on our sub blocks
			// (itemBlock.valueConnection_).
			var i = 0;
			while (itemBlock) {
				// `this` refers to the main block (which is being "mutated").
				var input = this.getInput('ADD' + i);
				// This is the important line of this function!
				itemBlock.valueConnection_ = input && input.connection.targetConnection;
				i++;
				itemBlock = itemBlock.nextConnection &&
					itemBlock.nextConnection.targetBlock();
			}
		},

		/**
		 * Adds inputs to the block until it reaches the target number of inputs.
		 * @param {number} targetCount The target number of inputs for the block.
		 * @this {Blockly.Block}
		 * @private
		 */
		updateShape_: function (targetCount) {

			while (this.itemCount_ < targetCount) {
				var input;
				if (this.itemCount_ == 0) {
					input = this.appendValueInput('ADD' + this.itemCount_)
						.setCheck('pair_value')
				}
				else {
					input = this.appendValueInput('ADD' + this.itemCount_);
				}

				var connection = input.connection
				var otherConnection;
				if (connection.isConnected()) {
					var otherBlock = connection.targetConnection.getSourceBlock();
					if (otherBlock.isShadow()) {
						// Don't respawn shadows.
						connection.setShadowDom(null);
						connection.disconnect();
						otherBlock.dispose(true);
					} else {
						// Used to reconnect non-shadows later.
						otherConnection = connection.targetConnection;
					}
				}

				const shadowState = {
					type: 'pair_value',
				};
				connection.setShadowState(shadowState);


				if (otherConnection) {
					connection.connect(otherConnection);
				}
				this.itemCount_++;
			}
			while (this.itemCount_ > targetCount) {
				this.itemCount_--;
				this.removeInput('ADD' + this.itemCount_);
			}
		},

		onchange: function (e) {
			if (e.type === Blockly.Events.BLOCK_CHANGE && e.element === 'field' && e.name === 'CMD') {

				var input = this.getFieldValue('query').trim()
				setTimeout(() => {
					var occurrences = (input.match(/:\w+/g) || [])

					this.inputCounter = occurrences.length
					this.minInputs = this.inputCounter
					this.updateShape_(occurrences.length)

					for (var i = 0; i < this.itemCount_; i++) {
						var targetBlock = this.getInput('ADD' + i).connection.targetBlock()

						// console.log(targetBlock.getField('NAME'))
						targetBlock.setFieldValue(occurrences[i], 'NAME')
						targetBlock.getField('NAME').enabled_ = false
						// targetBlock.disabled = true
						targetBlock.movable_ = false

					}
				}, 500)
			}


			if (e.type === 'move' && e.reason?.includes('disconnect') && e.blockId !== this.id) {
				if (this.workspace.getBlockById(e.blockId)?.isShadow_) {
					this.workspace.getBlockById(e.blockId)?.dispose()
				}
			}


		}

	}

}
