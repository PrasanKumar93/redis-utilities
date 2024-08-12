const CONSTANTS = {
  HTTP_STATUS_CODES: {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    METHOD_NOT_ALLOWED: 405,
    INTERNAL_SERVER_ERROR: 500,
  },
};

const DISABLE_JS_DATA = {
  NAMES_GLOBAL: ["window", "document", "global", "process"],
  NAMES_DANGEROUS: ["eval"],
  NAMES_TIME_INTERVALS: ["setTimeout", "setInterval"],
  NAMES_NETWORK: ["fetch", "XMLHttpRequest"],
  NAMES_MODULES: ["require", "module", "exports"],
  NAMES_CONSOLE: ["console"],

  CONSTRUCT_FUNCTIONS: [
    "FunctionDeclaration",
    "FunctionExpression",
    "ArrowFunctionExpression",
  ],

  CONSTRUCT_LOOPS: [
    "ForStatement",
    "WhileStatement",
    "DoWhileStatement",
    "ForInStatement",
    "ForOfStatement",
  ],

  CALL_EXPRESSION_ARRAY_LOOPS: [
    "forEach",
    "map",
    "filter",
    "reduce",
    "some",
    "every",
  ],
};

const DISABLE_JS_FLAGS = {
  NAMES_GLOBAL: true,
  NAMES_DANGEROUS: true,
  NAMES_TIME_INTERVALS: true,
  NAMES_NETWORK: true,
  NAMES_MODULES: true,
  NAMES_CONSOLE: true,
  NESTED_FUNCTIONS: true,
  LOOPS: true,
  ARRAY_LOOPS: true,
};

type DisableJsFlagsType = {
  [key in keyof typeof DISABLE_JS_FLAGS]: boolean;
};

export { CONSTANTS, DISABLE_JS_DATA, DISABLE_JS_FLAGS };

export type { DisableJsFlagsType };
