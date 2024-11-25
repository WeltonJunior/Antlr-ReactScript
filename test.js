import antlr4 from 'antlr4';
import JavaScriptLexer from './JavaScriptLexer.js';
import JavaScriptParser from './JavaScriptParser.js';
import MyJavaScriptVisitor from './MyJavaScriptVisitor.js';
import JavaScriptParserVisitor from './JavaScriptParserVisitor.js';
import ReactScriptTranspiler from './ReactScriptTranspiler.js';

const input = `
component Contador() {
    state contador = 0;

    effect [contador] {
        console.log("oi");
    }

    return (
        <div>
            <h1>Contador: {contador}</h1>
            <button onClick={() => contador++}>Incrementar</button>
        </div>
    );
}

component App() {
    ref elemento = null;

    effect {
        console.log("App montado");
        return () => console.log("App desmontado");
    }

    return (
        <div ref={elemento}>
            <h1>Bem-vindo ao ReactScript!</h1>
            
        </div>
    );
}
`;

const chars = new antlr4.InputStream(input);
const lexer = new JavaScriptLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new JavaScriptParser(tokens);
const tree = parser.program();

const visitor = new ReactScriptTranspiler();
const out = visitor.visit(tree);

console.log("------------------")
console.log(out)