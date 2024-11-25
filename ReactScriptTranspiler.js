import JavaScriptParserVisitor from './JavaScriptParserVisitor.js';
import JavaScriptParser from './JavaScriptParser.js';

function toArray(maybeArray) {
  if (!maybeArray) {
    return [];
  } else if (Array.isArray(maybeArray)) {
    return maybeArray;
  } else {
    return [maybeArray];
  }
}

class ReactScriptTranspiler extends JavaScriptParserVisitor {
  constructor() {
    super();
    this.output = '';
  }

  visitProgram(ctx) {
    this.visitChildren(ctx);
    return this.output;
  }

  visitComponentDeclaration(ctx) {
    const componentName = ctx.identifier().getText();
    const params = ctx.formalParameterList()
      ? this.visit(ctx.formalParameterList())
      : '';
    const body = this.visit(ctx.block());

    const code = `function ${componentName}(${params}) ${body}\n`;
    this.output += code;
    return null;
  }

  visitStateDeclaration(ctx) {
    const variableName = this.visit(ctx.assignable());
    const initialValue = ctx.singleExpression()
      ? this.visit(ctx.singleExpression())
      : 'undefined';

    if (!this.stateVariables) {
      this.stateVariables = new Set();
    }
    this.stateVariables.add(variableName);

    const code = `const [${variableName}, set${capitalize(
      variableName,
    )}] = React.useState(${initialValue});`;
    return code;
  }

  visitEffectStatement(ctx) {
    const dependencies = ctx.expressionSequence()
      ? `[${this.visit(ctx.expressionSequence())}]`
      : '[]';
    const body = this.visit(ctx.block());

    const code = `React.useEffect(() => ${body}, ${dependencies});`;
    return code;
  }

  visitRefDeclaration(ctx) {
    const variableName = this.visit(ctx.assignable());
    const initialValue = ctx.singleExpression()
      ? this.visit(ctx.singleExpression())
      : 'null';

    const code = `const ${variableName} = React.useRef(${initialValue});`;
    return code;
  }

  visitBlock(ctx) {
    const statements = ctx.statementList()
      ? this.visit(ctx.statementList())
      : '';
    return `{\n${statements}\n}`;
  }

  visitStatementList(ctx) {
    const statements = toArray(ctx.statement());
    return statements.map((stmt) => this.visit(stmt)).join('\n');
  }

  visitReturnStatement(ctx) {
    const expression = ctx.expressionSequence()
      ? this.visit(ctx.expressionSequence())
      : '';
    return `return ${expression};`;
  }

  visitExpressionStatement(ctx) {
    const expression = this.visit(ctx.expressionSequence());
    return `${expression};`;
  }

  visitExpressionSequence(ctx) {
    const expressions = toArray(ctx.singleExpression());
    return expressions.map((expr) => this.visit(expr)).join(', ');
  }

  // Implementação de métodos para Single Expressions
  visitSingleExpression(ctx) {
    if (ctx instanceof JavaScriptParser.IdentifierExpressionContext) {
      return this.visitIdentifierExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.LiteralExpressionContext) {
      return this.visitLiteralExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.MemberDotExpressionContext) {
      return this.visitMemberDotExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ArgumentsExpressionContext) {
      return this.visitArgumentsExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ArrowFunctionContext) {
      return this.visitArrowFunction(ctx);
    } else if (ctx instanceof JavaScriptParser.AssignmentExpressionContext) {
      return this.visitAssignmentExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.PostIncrementExpressionContext) {
      return this.visitPostIncrementExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.PostDecreaseExpressionContext) {
      return this.visitPostDecreaseExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.ParenthesizedExpressionContext) {
      return this.visitParenthesizedExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.BinaryExpressionContext) {
      return this.visitBinaryExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.UnaryMinusExpressionContext) {
      return this.visitUnaryMinusExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.UnaryPlusExpressionContext) {
      return this.visitUnaryPlusExpression(ctx);
    } else if (ctx instanceof JavaScriptParser.TernaryExpressionContext) {
      return this.visitTernaryExpression(ctx);
    } else {
      return ctx.getText();
    }
  }

  visitIdentifierExpression(ctx) {
    return this.visit(ctx.identifier());
  }

  visitLiteralExpression(ctx) {
    return this.visit(ctx.literal());
  }

  visitMemberDotExpression(ctx) {
    const object = this.visit(ctx.singleExpression(0));
    const property = this.visit(ctx.identifierName());
    return `${object}.${property}`;
  }

  visitArgumentsExpression(ctx) {
    const func = this.visit(ctx.singleExpression());
    const args = this.visit(ctx.arguments());
    return `${func}${args}`;
  }

  visitArguments(ctx) {
    const argList = toArray(ctx.argument())
      .map((arg) => this.visit(arg))
      .join(', ');
    return `(${argList})`;
  }

  visitArgument(ctx) {
    return this.visit(ctx.singleExpression());
  }

  visitAssignmentExpression(ctx) {
    const left = this.visit(ctx.singleExpression(0));
    const right = this.visit(ctx.singleExpression(1));
    return `${left} = ${right}`;
  }

  visitPostIncrementExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    if (this.isStateVariable(expression)) {
      const setter = `set${capitalize(expression)}`;
      return `${setter}(${expression} + 1)`;
    }
    return `${expression}++`;
  }

  isStateVariable(variable) {
    return this.stateVariables && this.stateVariables.has(variable);
  }

  visitPostDecreaseExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    return `${expression}--`;
  }

  visitParenthesizedExpression(ctx) {
    const expression = this.visit(ctx.expressionSequence());
    return `(${expression})`;
  }

  visitBinaryExpression(ctx) {
    const left = this.visit(ctx.singleExpression(0));
    const operator = ctx.getChild(1).getText();
    const right = this.visit(ctx.singleExpression(1));
    return `${left} ${operator} ${right}`;
  }

  visitUnaryMinusExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    return `-${expression}`;
  }

  visitUnaryPlusExpression(ctx) {
    const expression = this.visit(ctx.singleExpression());
    return `+${expression}`;
  }

  visitTernaryExpression(ctx) {
    const condition = this.visit(ctx.singleExpression(0));
    const trueExpr = this.visit(ctx.singleExpression(1));
    const falseExpr = this.visit(ctx.singleExpression(2));
    return `${condition} ? ${trueExpr} : ${falseExpr}`;
  }

  visitArrowFunction(ctx) {
    const params = this.visit(ctx.arrowFunctionParameters());
    const body = this.visit(ctx.arrowFunctionBody());
    return `${params} => ${body}`;
  }

  visitArrowFunctionParameters(ctx) {
    if (ctx.identifier()) {
      return ctx.identifier().getText();
    } else if (ctx.formalParameterList()) {
      return `(${this.visit(ctx.formalParameterList())})`;
    } else {
      return '()';
    }
  }

  visitArrowFunctionBody(ctx) {
    if (ctx.singleExpression()) {
      return this.visit(ctx.singleExpression());
    } else if (ctx.block()) {
      return this.visit(ctx.block());
    } else {
      return '';
    }
  }

  visitIdentifier(ctx) {
    const identifier = ctx.getToken(JavaScriptParser.Identifier, 0);
    if (identifier) {
      return identifier.getText();
    } else {
      return ctx.getText();
    }
  }
  visitLiteral(ctx) {
    const stringLiteral = ctx.getToken(JavaScriptParser.StringLiteral, 0);
    if (stringLiteral) {
      return stringLiteral.getText();
    } else if (ctx.numericLiteral()) {
      return this.visit(ctx.numericLiteral());
    } else {
      const booleanLiteral = ctx.getToken(JavaScriptParser.BooleanLiteral, 0);
      if (booleanLiteral) {
        return booleanLiteral.getText();
      } else {
        return ctx.getText();
      }
    }
  }

  visitNumericLiteral(ctx) {
    return ctx.getText();
  }

  visitIdentifierName(ctx) {
    return ctx.getText();
  }

  visitFormalParameterList(ctx) {
    const params = toArray(ctx.formalParameterArg());
    return params.map((param) => this.visit(param)).join(', ');
  }

  visitFormalParameterArg(ctx) {
    return this.visit(ctx.assignable());
  }

  visitAssignable(ctx) {
    return ctx.getText();
  }

  visitJsxElement(ctx, level = 1) {
    if (ctx.jsxSelfClosingElement()) {
      console.log(
        'SelfClosingElement: ',
        ctx.jsxSelfClosingElement().getText(),
      );
      return this.visitJsxSelfClosingElement(ctx.jsxSelfClosingElement());
    }
    const opening = this.visit(ctx.jsxOpeningElement());
    const children = ctx.jsxChildren()
      ? this.visitJsxChildren(ctx.jsxChildren(), level + 1)
      : '';
    const closing = this.visit(ctx.jsxClosingElement());
    const indent = '  '.repeat(level);

    return `${indent}${opening}\n${children}\n${indent}${closing}`;
  }

  visitJsxSelfClosingElement(ctx) {
    console.log('ctx: ', ctx.getText());
    const name = this.visit(ctx.jsxSelfClosingElementName());
    const attributes = ctx.jsxAttributes()
      ? ' ' + this.visit(ctx.jsxAttributes())
      : '';
    return `<${name} ${attributes} />`;
  }

  jsxSelfClosingElementName(ctx) {
    return ctx.getText();
  }

  visitJsxOpeningElement(ctx) {
    const name = this.visit(ctx.jsxOpeningElementName());
    const attributes = ctx.jsxAttributes()
      ? ' ' + this.visit(ctx.jsxAttributes()).trim()
      : '';
    return `<${name}${attributes}>`;
  }

  visitJsxClosingElement(ctx) {
    const name = this.visit(ctx.jsxClosingElementName());
    return `</${name}>`;
  }

  visitJsxAttributes(ctx) {
    const attrs = toArray(ctx.jsxAttribute());
    return attrs.map((attr) => this.visit(attr)).join(' ');
  }

  visitJsxAttribute(ctx) {
    const name = this.visit(ctx.jsxAttributeName());
    const value = ctx.jsxAttributeValue()
      ? `=${this.visit(ctx.jsxAttributeValue())}`
      : '';
    return `${name}${value}`;
  }

  visitJsxAttributeName(ctx) {
    return ctx.getText();
  }

  visitJsxAttributeValue(ctx) {
    if (ctx.StringLiteral) {
      return ctx.StringLiteral.getText();
    } else if (ctx.jsxElement()) {
      return `{${this.visit(ctx.jsxElement())}}`;
    } else if (ctx.objectExpressionSequence()) {
      const expression = this.visit(ctx.objectExpressionSequence());
      return `{${this.transformExpression(expression)}}`;
    } else {
      return ctx.getText();
    }
  }

  transformExpression(expression) {
    if (expression.includes('++')) {
      return this.transformIncrement(expression);
    } else if (expression.includes('--')) {
      return this.transformDecrement(expression);
    }
    return expression;
  }

  visitJsxChildren(ctx, level = 1) {
    const children = toArray(ctx.children);
    const indent = '  '.repeat(level);

    return children
      .map((child) => {
        if (!child) return ''; // Nó inválido
        if (child.constructor.name === 'Fe') {
          // Texto puro
          return `${indent}${child.symbol.text.trim()}`;
        } else if (
          child.constructor.name === 'ObjectExpressionSequenceContext'
        ) {
          // Expressões como {contador}
          const expression = this.visit(child.expressionSequence());
          return `${indent}{${expression}}`;
        } else if (child.constructor.name === 'JsxElementContext') {
          // Elementos aninhados
          return this.visitJsxElement(child, level);
        }
        return ''; // Ignorar outros tipos de nós
      })
      .join('\n');
  }

  transformIncrement(expression) {
    // Regex para localizar incrementos ou decrementos dentro de uma expressão
    const match = expression.match(/(\w+)\s*(\+\+)/);

    if (match) {
      const variable = match[1]; // Nome da variável
      if (this.isStateVariable(variable)) {
        const setter = `set${capitalize(variable)}`;
        return expression.replace(
          /(\w+)\s*(\+\+)/, // Substitui "variavel++"
          `${setter}(${variable} + 1)`,
        );
      }
    }

    return expression; // Retorna a expressão original se não houver correspondência
  }

  transformDecrement(expression) {
    // Regex para localizar decrementos dentro de uma expressão
    const match = expression.match(/(\w+)\s*(--)/);

    if (match) {
      const variable = match[1]; // Nome da variável
      if (this.isStateVariable(variable)) {
        const setter = `set${capitalize(variable)}`;
        return expression.replace(
          /(\w+)\s*(--)/, // Substitui "variavel--"
          `${setter}(${variable} - 1)`,
        );
      }
    }

    return expression; // Retorna a expressão original se não houver correspondência
  }

  visitJsxOpeningElementName(ctx) {
    return ctx.getText();
  }

  visitJsxClosingElementName(ctx) {
    return ctx.getText();
  }

  visitObjectExpressionSequence(ctx) {
    return this.visit(ctx.expressionSequence());
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default ReactScriptTranspiler;
