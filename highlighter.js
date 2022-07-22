const codePrefix = 'code-';

const commentClassName = `${codePrefix}comment`;
const keywordClassName = `${codePrefix}keyword`;
const numbersClassName = `${codePrefix}number-literal`;
const literalsClassName = `${codePrefix}literal`;
const classesClassName = `${codePrefix}class`;
const functionsClassName = `${codePrefix}function`;
const identifiersClassName = `${codePrefix}identifier`; // is not used in the highlighting because of conflicts with
                                                        // the function name pattern. The identifiers will use the
                                                        // formatting of the parent element.


/**
 * A class that represents a grammar of a programming language.
 *
 * Contains grammars of all language constructs, get() method that returns an Object of the constructs in the
 * formatting order, and some useful private methods.
 *
 * Instances of this class shouldn't be created.
 */
class Grammar {
    /**
     * Returns a RegExp that matches **comments** in the specific language.
     * @returns {RegExp}
     */
    static comments() {
    }

    /**
     * Returns a RegExp that matches **keywords** in the specific language.
     * @returns {RegExp}
     */
    static keywords() {
    }

    /**
     * Returns the RegExp that matches any of the language keywords in the given list.
     * @param keywordsList
     * @returns String
     * @private
     */
    static _getKeywordsRegExpString(keywordsList) {
        return '\\b(' + keywordsList.map((x) => `(${x})`).join('|') + ')(?=[ \\.{\\[\\);])';
    }

    /**
     * Returns a RegExp that matches **numbers literals** in the specific language.
     * @returns {RegExp}
     */
    static numbers() {
    }

    /**
     * Returns a RegExp that matches **string literals** in the specific language.
     * @returns {RegExp}
     */
    static literals() {
    }

    /**
     * Returns a RegExp that matches **class names** in the specific language.
     * @returns {RegExp}
     */
    static classes() {
    }

    /**
     * Returns a RegExp that matches **identifiers** in the specific language.
     * @returns {RegExp}
     */
    static identifiers() {
    }

    /**
     * Returns a RegExp that matches **functions** in the specific language.
     * @returns {RegExp}
     */
    static functions() {
    }

    /**
     * Returns an Object of the HTML class names connected to the RegExps matching that language constructs.
     * @returns {{[p: string]: RegExp}}
     */
    static get() {
        return Object.fromEntries([
            [keywordClassName, this.keywords()],
            [literalsClassName, this.literals()],
            [functionsClassName, this.functions()],
            [numbersClassName, this.numbers()],
            [classesClassName, this.classes()],
            [commentClassName, this.comments()]
        ]);
    }

    /**
     * Returns the concatenated RegExp: regexp1 + regexp2.
     * The result has the same flags that regexp1 had.
     * @param regexp1 the first regular expression
     * @param regexp2 the second regular expression to concatenate with the first
     * @returns {RegExp} the concatenated RegExp of the given two with the flags of the first one
     * @private is used inside the Grammar subclasses
     */
    static _concatRegExp(regexp1, regexp2) {
        const flags = regexp1.flags;
        const s1 = regexp1.toString();
        const s2 = regexp2.toString();

        return RegExp(''.concat(this._trimRegExpString(s1), this._trimRegExpString(s2)), flags);
    }

    /**
     * Returns the string representation of the regexp without the first character (which is '/' in RegExp toString)
     * and the part of the string after the last.
     * @param regexpStr
     * @returns {string}
     * @private
     */
    static _trimRegExpString(regexpStr) {
        return regexpStr.substring(1, regexpStr.lastIndexOf('/'));
    }
}

/**
 * A class that represents Dart programming language grammar.
 */
class DartGrammar extends Grammar {
    static comments() {
        return /(\/\/[^\n]*)|(\/\*.*?\*\/)/sg;
    }

    static keywords() {
        return RegExp(this._getKeywordsRegExpString([
            'abstract', 'else', 'import',
            'show', 'as', 'enum',
            'in', 'static', 'assert',
            'export', 'interface', 'super',
            'async\\*?', 'extends', 'is',
            'switch', 'await', 'extension',
            'late', 'sync\\*?', 'break',
            'external', 'library', 'this',
            'case', 'factory', 'mixin',
            'throw', 'catch', 'false',
            'new', 'true', 'class',
            'final', 'null', 'try',
            'const', 'finally', 'on',
            'typedef', 'continue', 'for',
            'operator', 'var', 'covariant',
            'Function', 'part', 'void',
            'default', 'get', 'required',
            'while', 'deferred', 'hide',
            'rethrow', 'with', 'do', 'if',
            'return', 'yield', 'dynamic',
            'implements', 'set', 'null',
            'this'
        ]), 'g');
    }

    static numbers() {
        return /\b\d+(\.\d+)?\b/g;
    }

    static literals() {
        let r1 = /'(?!>)((\\')|[^'])*'(?!>)/g;
        let r2 = /|"(?!>)((\\")|[^"])*"(?!>)/g;

        return this._concatRegExp(r1, r2);
    }

    static classes() {
        return /\b((int)|(bool)|(double)|(num)|([A-Z][A-Za-z]*(<[\w?]+>)?(\(.*\))?))\b/g;
    }

    static identifiers() {
        return /\b[a-zA-Z_]\w*\b/g;
    }

    static functions() {
        return this._concatRegExp(this.identifiers(), / *(?=\()/);
    }

}

/**
 * A function that takes an HTML DOM element and a programming language Grammar (should inherit
 * the Grammar class) and decorates the innerHTML of the codeHolderNode with spans.
 *
 * The class names are defined at the top of this file.
 * By default, they are the following:
 * * classes: .code-class
 * * functions: .code-function
 * * string literals: .code-literal
 * * numbers literals: .code-number-literal
 * * keywords: .code-keyword
 * * comments: .code-comment
 * @param codeHolderNode an element which HTML content will be processed
 * @param grammar an inheritor of Grammar class - a grammar of a programming language
 */
function highlight(codeHolderNode, grammar) {
    const grammarEntries = grammar.get();
    for (const className in grammarEntries) {
        _highlightElement(codeHolderNode, grammarEntries[className], (str) => _highlightEntry(str, className));
    }
}

/**
 * Encases the
 * @param str
 * @param className
 * @returns {string}
 * @private
 */
function _highlightEntry(str, className) {
    return `<span class="${className}">${str}</span>`;
}

function _highlightElement(element, regexp, formatFunc) {
    element.innerHTML = element.innerHTML.replaceAll(regexp, formatFunc);
}
