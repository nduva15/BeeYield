const fs = require('fs');
const content = fs.readFileSync('src/pages/PandaMiti.tsx', 'utf8');

const ts = require('typescript');
const sourceFile = ts.createSourceFile('PandaMiti.tsx', content, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);

function reportDiagnostics(sourceFile) {
  const program = ts.createProgram(['src/pages/PandaMiti.tsx'], { jsx: ts.JsxEmit.ReactJSX });
  const diagnostics = ts.getPreEmitDiagnostics(program, sourceFile);
  diagnostics.forEach(diag => {
    const { line, character } = diag.file.getLineAndCharacterOfPosition(diag.start);
    const message = ts.flattenDiagnosticMessageText(diag.messageText, '\n');
    console.log(`TS Diagnostic: ${line + 1}:${character + 1} - ${message}`);
  });
}

reportDiagnostics(sourceFile);
