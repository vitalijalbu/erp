import Blockly from "blockly";
import generator from './generator.js'


var workspace = new Blockly.Workspace();
Blockly.serialization.workspaces.load({
    "blocks": {
        "languageVersion": 0,
        "blocks": [
            {
                "type": "date_format",
                "id": "gD:@*aixL3_Z#N^#l*DC",
                "x": 39,
                "y": 76,
                "fields": {
                    "Format": "d-m-Y"
                },
                "inputs": {
                    "DATE": {
                        "block": {
                            "type": "global_current_date",
                            "id": "V`:=AotJ{[lc*sE%d_Ui"
                        }
                    }
                }
            }
        ]
    }
}, workspace);

console.log(generator.workspaceToCode(workspace));
