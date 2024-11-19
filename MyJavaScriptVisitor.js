import JavaScriptParserVisitor from './JavaScriptParserVisitor.js';

class MyJavaScriptVisitor extends JavaScriptParserVisitor {
    visitFunctionDeclaration(ctx) {
        const functionName = ctx.identifier().getText();
        console.log(`Função encontrada: ${functionName}`);
        return this.visitChildren(ctx);
    }

    visitExpressionStatement(ctx) {
        console.log('Expressão encontrada:', ctx.getText());
        return this.visitChildren(ctx);
    }

    // Adicione mais métodos conforme necessário para personalizar a visita
}

export default MyJavaScriptVisitor;
