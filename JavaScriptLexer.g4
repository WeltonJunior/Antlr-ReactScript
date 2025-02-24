/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014 by Bart Kiers (original author) and Alexandre Vitorelli (contributor -> ported to CSharp)
 * Copyright (c) 2017-2020 by Ivan Kochurkin (Positive Technologies):
    added ECMAScript 6 support, cleared and transformed to the universal grammar.
 * Copyright (c) 2018 by Juan Alvarez (contributor -> ported to Go)
 * Copyright (c) 2019 by Student Main (contributor -> ES2020)
 * Copyright (c) 2024 by Andrew Leppard (www.wegrok.review)
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

// $antlr-format alignTrailingComments true, columnLimit 150, maxEmptyLinesToKeep 1, reflowComments false, useTab false
// $antlr-format allowShortRulesOnASingleLine true, allowShortBlocksOnASingleLine true, minEmptyLines 0, alignSemicolons ownLine
// $antlr-format alignColons trailing, singleLineOverrulesHangingColon true, alignLexerCommands true, alignLabels true, alignTrailers true

lexer grammar JavaScriptLexer;

channels {
    ERROR
}

options {
    superClass = JavaScriptLexerBase;
}

HashBangLine: { this.IsStartOfFile()}? '#!' ~[\r\n\u2028\u2029]*; // only allowed at start

JsxElementBegin  : '<' {this.IsJsxPossible()}? -> pushMode(JSX_OPENING_ELEMENT);

OpenBracket                : '[';
CloseBracket               : ']';
OpenParen                  : '(';
CloseParen                 : ')';
OpenBrace                  : '{' {this.ProcessOpenBrace();} -> pushMode(DEFAULT_MODE);
CloseBrace                 : '}' {this.ProcessCloseBrace();} -> popMode;
SemiColon                  : ';';
Comma                      : ',';
Assign                     : '=';
QuestionMark               : '?';
Colon                      : ':';
Ellipsis                   : '...';
Dot                        : '.';
PlusPlus                   : '++';
MinusMinus                 : '--';
Plus                       : '+';
Minus                      : '-';
BitNot                     : '~';
Not                        : '!';
Multiply                   : '*';
Divide                     : '/';
Modulus                    : '%';
Power                      : '**';
NullCoalesce               : '??';
Hashtag                    : '#';
RightShiftArithmetic       : '>>';
LeftShiftArithmetic        : '<<';
RightShiftLogical          : '>>>';
LessThan                   : '<';
MoreThan                   : '>';
LessThanEquals             : '<=';
GreaterThanEquals          : '>=';
Equals_                    : '==';
NotEquals                  : '!=';
IdentityEquals             : '===';
IdentityNotEquals          : '!==';
BitAnd                     : '&';
BitXOr                     : '^';
BitOr                      : '|';
And                        : '&&';
Or                         : '||';
MultiplyAssign             : '*=';
DivideAssign               : '/=';
ModulusAssign              : '%=';
PlusAssign                 : '+=';
MinusAssign                : '-=';
LeftShiftArithmeticAssign  : '<<=';
RightShiftArithmeticAssign : '>>=';
RightShiftLogicalAssign    : '>>>=';
BitAndAssign               : '&=';
BitXorAssign               : '^=';
BitOrAssign                : '|=';
PowerAssign                : '**=';
ARROW                      : '=>';

/// Null Literals

NullLiteral: 'null';

/// Boolean Literals

BooleanLiteral: 'true' | 'false';

/// Numeric Literals

DecimalLiteral:
    DecimalIntegerLiteral '.' [0-9] [0-9_]* ExponentPart?
    | '.' [0-9] [0-9_]* ExponentPart?
    | DecimalIntegerLiteral ExponentPart?
;

/// Numeric Literals

HexIntegerLiteral    : '0' [xX] [0-9a-fA-F] HexDigit*;
OctalIntegerLiteral  : '0' [0-7]+ {!this.IsStrictMode()}?;
OctalIntegerLiteral2 : '0' [oO] [0-7] [_0-7]*;
BinaryIntegerLiteral : '0' [bB] [01] [_01]*;

BigHexIntegerLiteral     : '0' [xX] [0-9a-fA-F] HexDigit* 'n';
BigOctalIntegerLiteral   : '0' [oO] [0-7] [_0-7]* 'n';
BigBinaryIntegerLiteral  : '0' [bB] [01] [_01]* 'n';
BigDecimalIntegerLiteral : DecimalIntegerLiteral 'n';

/// Keywords

Break      : 'break';
Do         : 'do';
Instanceof : 'instanceof';
Typeof     : 'typeof';
Case       : 'case';
Else       : 'else';
New        : 'new';
Var        : 'var';
Catch      : 'catch';
Finally    : 'finally';
Return     : 'return';
Void       : 'void';
Continue   : 'continue';
For        : 'for';
Switch     : 'switch';
While      : 'while';
Debugger   : 'debugger';
Function_  : 'function';
This       : 'this';
With       : 'with';
Default    : 'default';
If         : 'if';
Throw      : 'throw';
Delete     : 'delete';
In         : 'in';
Try        : 'try';
As         : 'as';
From       : 'from';
YieldStar  : 'yield*';

/// Future Reserved Words

Class     : 'class';
Enum      : 'enum';
Extends   : 'extends';
Super     : 'super';
Const     : 'const';
Export    : 'export';
Import    : 'import';
Async     : 'async';
Await     : 'await';

/// Novos tokens em maiúsculas

STATE     : 'state';     // Novo
EFFECT    : 'effect';    // Novo
REF       : 'ref';       // Novo
COMPONENT : 'component'; // Novo

/// The following tokens are also considered to be FutureReservedWords
/// when parsing strict mode

Implements   : 'implements' {this.IsStrictMode()}?;
StrictLet    : 'let'        {this.IsStrictMode()}?;
NonStrictLet : 'let'        {!this.IsStrictMode()}?;
Private      : 'private'    {this.IsStrictMode()}?;
Public       : 'public'     {this.IsStrictMode()}?;
Interface    : 'interface'  {this.IsStrictMode()}?;
Package      : 'package'    {this.IsStrictMode()}?;
Protected    : 'protected'  {this.IsStrictMode()}?;
Static       : 'static'     {this.IsStrictMode()}?;
Yield        : 'yield'      {this.IsStrictMode()}?;

/// Identifier Names and Identifiers

Identifier: IdentifierStart IdentifierPart*;
/// String Literals
StringLiteral:
    ('"' DoubleStringCharacter* '"' | '\'' SingleStringCharacter* '\'') {this.ProcessStringLiteral();}
;

LinkLiteral: ('http' 's'? | 'ftp' | 'file') '://' [a-zA-Z0-9./?=]+; // TODO Could be more precise

BackTick: '`' {this.IncreaseTemplateDepth();} -> pushMode(TEMPLATE);

WhiteSpaces: [\t\u000B\u000C\u0020\u00A0]+ -> channel(HIDDEN);

LineTerminator: [\r\n\u2028\u2029] -> channel(HIDDEN);

/// Comments

JsxComment        : '{/*' .*? '*/}'           -> channel(HIDDEN);
MultiLineComment  : '/*' .*? '*/'             -> channel(HIDDEN);
SingleLineComment : '//' ~[\r\n\u2028\u2029]* -> channel(HIDDEN);
RegularExpressionLiteral:
    '/' RegularExpressionFirstChar RegularExpressionChar* {this.IsRegexPossible()}? '/' IdentifierPart*
;

HtmlComment         : '<!--' .*? '-->'      -> channel(HIDDEN);
CDataComment        : '<![CDATA[' .*? ']]>' -> channel(HIDDEN);
UnexpectedCharacter : .                     -> channel(ERROR);
CDATA               : '<![CDATA[' .*? ']]>' -> channel(HIDDEN);

mode TEMPLATE;

BackTickInside                : '`'  {this.DecreaseTemplateDepth();} -> type(BackTick), popMode;
TemplateStringStartExpression : '${' -> pushMode(DEFAULT_MODE);
TemplateStringAtom            : ~[`];

// Lexer mode for JSX opening elements.
// See https://github.com/facebook/jsx?tab=readme-ov-file
// and https://facebook.github.io/jsx/ for more information
//
// e.g. <DropDownMenu...>
//      <DropDownMenu.../>
mode JSX_OPENING_ELEMENT;

JsxOpeningElementBegin  : '<' -> pushMode(JSX_OPENING_ELEMENT);
JsxOpeningElementEnd : '>' -> popMode, pushMode(JSX_CHILDREN);
JsxOpeningElementSlashEnd: '/>' -> popMode;
JsxAssign : '=';
JsxOpeningElementOpenBrace: '{' {this.ProcessOpenBrace();} -> pushMode(DEFAULT_MODE);
JsxOpeningElementId: TagNameStartChar TagNameChar*;
JsxOpeningElementWhiteSpaces: [\t\u000B\u000C\u0020\u00A0]+ -> channel(HIDDEN);
JsxOpeningElementLineTerminator: [\r\n\u2028\u2029] -> channel(HIDDEN);
JsxOpeningElementMultiLineComment  : '/*' .*? '*/'             -> channel(HIDDEN);
JsxOpeningElementSingleLineComment : '//' ~[\r\n\u2028\u2029]* -> channel(HIDDEN);
JsxAttributeValue: DoubleQuoteString | SingleQuoteString | AttributeChar | HexChars | DecChars;

// Lexer mode for JSX child elements, e.g.
// <DropDownMenu>
//     <child elements>
// </DropDownMenu>
mode JSX_CHILDREN;

HtmlChardata
    : ~('<' | '{')+
    ;

JsxChildrenOpeningElementBegin  : '<' -> pushMode(JSX_OPENING_ELEMENT);
JsxChildrenClosingElementSlashBegin: '</' -> popMode, pushMode(JSX_CLOSING_ELEMENT);
JsxChildrenOpenBrace            : '{' {this.ProcessOpenBrace();} -> pushMode(DEFAULT_MODE);

// Lexer mode for JSX closing elements, e.g. </DropDownMenu>
mode JSX_CLOSING_ELEMENT;

JsxClosingElementEnd: '>' -> popMode;
JsxClosingElementId: TagNameStartChar TagNameChar*;
JsxClosingElementLineTerminator: [\r\n\u2028\u2029] -> channel(HIDDEN);
JsxClosingElementWhiteSpaces: [\t\u000B\u000C\u0020\u00A0]+ -> channel(HIDDEN);

// Fragment rules
fragment AttributeChar:
    '-'
    | '_'
    | '.'
    | '/'
    | '+'
    | ','
    | '?'
    | '='
    | ':'
    | ';'
    | '#'
    | [0-9a-zA-Z]
;

fragment AttributeChars: AttributeChar+ ' '?;

fragment HexChars: '#' [0-9a-fA-F]+;

fragment DecChars: [0-9]+ '%'?;

fragment DoubleQuoteString : '"' ~["]* '"';
fragment SingleQuoteString : '\'' ~[']* '\'';

fragment TagNameStartChar:
    [:a-zA-Z]
    | '\u2070' ..'\u218F'
    | '\u2C00' ..'\u2FEF'
    | '\u3001' ..'\uD7FF'
    | '\uF900' ..'\uFDCF'
    | '\uFDF0' ..'\uFFFD'
;

fragment TagNameChar:
    TagNameStartChar
    | '-'
    | '_'
    | '.'
    | Digit
    | '\u00B7'
    | '\u0300' ..'\u036F'
    | '\u203F' ..'\u2040'
;

fragment Digit: [0-9];

fragment DoubleStringCharacter: ~["\\] | '\\' EscapeSequence | LineContinuation;

fragment SingleStringCharacter: ~['\\] | '\\' EscapeSequence | LineContinuation;

fragment EscapeSequence:
    CharacterEscapeSequence
    | '0' // no digit ahead! TODO
    | HexEscapeSequence
    | UnicodeEscapeSequence
    | ExtendedUnicodeEscapeSequence
;

fragment CharacterEscapeSequence: SingleEscapeCharacter | NonEscapeCharacter;

fragment HexEscapeSequence: 'x' HexDigit HexDigit;

fragment UnicodeEscapeSequence:
    'u' HexDigit HexDigit HexDigit HexDigit
    | 'u' '{' HexDigit HexDigit+ '}'
;

fragment ExtendedUnicodeEscapeSequence: 'u' '{' HexDigit+ '}';

fragment SingleEscapeCharacter: ['"\\bfnrtv];

fragment NonEscapeCharacter: ~['"\\bfnrtv0-9xu\r\n];

fragment EscapeCharacter: SingleEscapeCharacter | [0-9] | [xu];

fragment LineContinuation: '\\' [\r\n\u2028\u2029];

fragment HexDigit: [_0-9a-fA-F];

fragment DecimalIntegerLiteral: '0' | [1-9] [0-9_]*;

fragment ExponentPart: [eE] [+-]? [0-9_]+;

fragment IdentifierPart: IdentifierStart | [\p{Mn}] | [\p{Nd}] | [\p{Pc}] | '\u200C' | '\u200D';

fragment IdentifierStart: [\p{L}] | [$_] | '\\' UnicodeEscapeSequence;

fragment RegularExpressionFirstChar:
    ~[*\r\n\u2028\u2029\\/[]
    | RegularExpressionBackslashSequence
    | '[' RegularExpressionClassChar* ']'
;

fragment RegularExpressionChar:
    ~[\r\n\u2028\u2029\\/[]
    | RegularExpressionBackslashSequence
    | '[' RegularExpressionClassChar* ']'
;

fragment RegularExpressionClassChar: ~[\r\n\u2028\u2029\]\\] | RegularExpressionBackslashSequence;

fragment RegularExpressionBackslashSequence: '\\' ~[\r\n\u2028\u2029];
