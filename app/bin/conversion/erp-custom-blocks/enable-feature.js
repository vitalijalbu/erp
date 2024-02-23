import Blockly from 'blockly';
import { FeaturesAutocomplete } from './custom-fields/features-autocomplete.js';

export const initEnableFeatureBlock = () => {

	Blockly.Blocks['enable_feature'] = {

		itemCounter: 1,

		minInputs: 0,
		options: [],

		init: function () {
			this.appendDummyInput('ENABLE')
				.appendField('Enable/Disable Feature:')
				.appendField('Feature:')
				.appendField(new Blockly.FieldDropdown(
					[['current', '0'], ['select feature', '1']]
				), 'option')
			this.appendDummyInput('ACTION')
				.appendField(new Blockly.FieldDropdown(
					[['enable', '1'], ['disable', '0']]
				), 'enable')
			//this.setHelpUrl(Blockly.Msg['LISTS_CREATE_WITH_HELPURL']);
			this.setStyle('list_blocks');
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
			this.setInputsInline(true);
			this.setOutput(false);
			this.setColour(160);
			this.setTooltip(`Enable or Disable a feature. 
				Choosing "current" will change the feature currently being processed.
				Otherwise you can specify the code of the desired feature.
			`);
			this.itemCount_ = this.minInputs;
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
			// console.log(this.getField("Feature")?.textContent_)
			return {
				itemCount: this.itemCount_,
				opt: [this.getFieldValue("Feature"), this.getField("Feature")?.textContent_?.nodeValue],
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.options = state['opt']
			let text = state['opt'] && state['opt'].length > 0 ? state["opt"][0] : ''
			this.updateShape_(state["itemCount"], text, this.options);
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
		updateShape_: function (targetCount,text='', opt=[]) {

			this.removeInput('ACTION');
			
			while (this.itemCount_ < targetCount) {

				var input = this.appendDummyInput('ADD' + this.itemCount_)
				.appendField(new FeaturesAutocomplete(text, opt), 'Feature')

				// var connection = input.connection
				// var otherConnection;
				// if (connection.isConnected()) {
				// 	var otherBlock = connection.targetConnection.getSourceBlock();
				// 	if (otherBlock.isShadow()) {
				// 		// Don't respawn shadows.
				// 		connection.setShadowDom(null);
				// 		connection.disconnect();
				// 		otherBlock.dispose(true);
				// 	} else {
				// 		// Used to reconnect non-shadows later.
				// 		otherConnection = connection.targetConnection;
				// 	}
				// }

				// const shadowState = {
				// 	type: 'text',
				// };
				// connection.setShadowState(shadowState);


				// if (otherConnection) {
				// 	connection.connect(otherConnection);
				// }
				this.itemCount_++;
			}
			
			this.appendDummyInput('ACTION')
			.appendField(new Blockly.FieldDropdown(
				[['enable', '1'], ['disable', '0']]
			), 'enable')

			while (this.itemCount_ > targetCount) {
				this.itemCount_--;
				this.removeInput('ADD' + this.itemCount_);
			}
		},


		onchange: function (e) {

			if (e.type === Blockly.Events.BLOCK_CHANGE && e.name === 'option' && e.blockId === this.id) {
				this.itemCounter = e.newValue == 0 ? 0 : 1
				this.minInputs = this.itemCounter

				this.updateShape_(e.newValue == 0 ? 0 : 1)
			}

			if (e.type === 'move' && e.reason?.includes('disconnect') && e.blockId !== this.id) {
				if (this.workspace.getBlockById(e.blockId)?.isShadow_) {
					this.workspace.getBlockById(e.blockId)?.dispose()
				}
			}
		}
	};
}
