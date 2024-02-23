import fs from 'fs';
import Blockly from "blockly";
import generator from './generator.js'
import prettier from "prettier/standalone";
import phpPlugin from "@prettier/plugin-php";

function argsParser(argsJson) {
    const args = argsJson;
    return args.map((arg) => '$'+arg.name).join(', ');
}

export default async function constraintConverter (constraint, out) {
    var workspace = new Blockly.Workspace();
    Blockly.serialization.workspaces.load(constraint.body, workspace);
    const generated = generator.workspaceToCode(workspace);

    const phpCode = `<?php
        function ${constraint.uuid}() {
            ${generated}
        }
    `
    
    const formattedCode = await prettier.format(phpCode, {
        phpVersion: '8.2',
        plugins: [phpPlugin],
        parser: "php"
    });

    if(out === null) {
        process.stdout.write(formattedCode);
    }
    else {
        try {
            fs.writeFileSync(out, formattedCode);
        } catch (err) {
            process.exit(1);
        }
    }

    process.exit(0);

}