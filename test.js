import antlr4 from 'antlr4';
import JavaScriptLexer from './JavaScriptLexer.js';
import JavaScriptParser from './JavaScriptParser.js';
import MyJavaScriptVisitor from './MyJavaScriptVisitor.js';

const input = `
function helloWorld() {
    console.log('Hello, World!');
}
`;

const chars = new antlr4.InputStream(input);
const lexer = new JavaScriptLexer(chars);
const tokens = new antlr4.CommonTokenStream(lexer);
const parser = new JavaScriptParser(tokens);
const tree = parser.program();

const visitor = new MyJavaScriptVisitor();
visitor.visit(tree);
