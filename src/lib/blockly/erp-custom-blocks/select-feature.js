import Blockly from 'blockly';
import { FeaturesAutocomplete } from './custom-fields/features-autocomplete';

export const initSelectFeature = () => {

	Blockly.Blocks['select-feature'] = {
		options: [],
		
		init: function() {
			this.appendDummyInput('Select')
				.appendField(new FeaturesAutocomplete(
					'', this.options), 'Feature'
				)
			this.setOutput(true);
			this.setPreviousStatement(false, null);
			this.setNextStatement(false, null);
			this.setColour('#56AD4B');
			this.setTooltip("Comment");
			this.setHelpUrl("");
		},

		/**
		 * Returns the state of this block as a JSON serializable object.
		 * @returns {{itemCount: number}} The state of this block, ie the item count.
		 */
		saveExtraState: function () {
			// console.log(this.getField("Feature")?.textContent_)
			return {
				// itemCount: this.itemCount_,
				opt: [this.getFieldValue("Feature"), this.getField("Feature")?.textContent_?.nodeValue],
			};
		},

		/**
		 * Applies the given state to this block.
		 * @param {*} state The state to apply to this block, ie the item count.
		 */
		loadExtraState: function (state) {
			this.options = state['opt']
		},
	};	
}
