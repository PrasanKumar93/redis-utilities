import type { DisableJsFlagsType } from "./constants.ts";

import * as acorn from "acorn";
import * as walk from "acorn-walk";

import { LoggerCls, CustomErrorCls } from "./logger.js";
import { DISABLE_JS_DATA, DISABLE_JS_FLAGS } from "./constants.js";

//#region private functions

const getCheckNamesAndConstructs = (df: DisableJsFlagsType) => {
  const CHECK_NAMES = [
    ...(df.NAMES_GLOBAL ? DISABLE_JS_DATA.NAMES_GLOBAL : []),
    ...(df.NAMES_DANGEROUS ? DISABLE_JS_DATA.NAMES_DANGEROUS : []),
    ...(df.NAMES_TIME_INTERVALS ? DISABLE_JS_DATA.NAMES_TIME_INTERVALS : []),
    ...(df.NAMES_NETWORK ? DISABLE_JS_DATA.NAMES_NETWORK : []),
    ...(df.NAMES_MODULES ? DISABLE_JS_DATA.NAMES_MODULES : []),
    ...(df.NAMES_CONSOLE ? DISABLE_JS_DATA.NAMES_CONSOLE : []),
  ];

  const CHECK_CONSTRUCTS = [
    ...(df.LOOPS ? DISABLE_JS_DATA.CONSTRUCT_LOOPS : []),
  ];

  return { CHECK_NAMES, CHECK_CONSTRUCTS };
};

//#endregion

const validateJS = (
  code: string,
  disableFlags: DisableJsFlagsType | null = null
): boolean => {
  let isValid = true;
  let error: any | null = null;
  let functionCount = 0;
  const disallowedArr: string[] = [];

  if (!disableFlags) {
    // default all checks
    disableFlags = DISABLE_JS_FLAGS;
  }

  const { CHECK_NAMES, CHECK_CONSTRUCTS } =
    getCheckNamesAndConstructs(disableFlags);

  const addDisallowedName = (node: acorn.Identifier) => {
    //node?.name = variable names, function names, etc.
    if (CHECK_NAMES.includes(node.name)) {
      disallowedArr.push(node.name);
    }
  };

  const addDisallowedConstruct = (node: acorn.Node) => {
    if (CHECK_CONSTRUCTS.includes(node.type)) {
      disallowedArr.push(node.type);
    }
  };

  const incrementFunctionCount = (node: acorn.Node) => {
    functionCount++;
  };

  const addDisallowedArrayLoops = (node: acorn.CallExpression) => {
    if (
      node.callee.type === "MemberExpression" &&
      node.callee.property.type === "Identifier"
    ) {
      const methodName = node.callee.property.name;
      const arrayLoops = DISABLE_JS_DATA.CALL_EXPRESSION_ARRAY_LOOPS;
      if (arrayLoops.includes(methodName)) {
        disallowedArr.push(`Array.${methodName}`);
      }
    }
  };

  try {
    // Parse the code to check for syntax errors  and generate an AST
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    // Traverse the AST to check for disallowed name & constructs
    walk.simple(ast, {
      Identifier: addDisallowedName,

      ForStatement: addDisallowedConstruct,
      WhileStatement: addDisallowedConstruct,
      DoWhileStatement: addDisallowedConstruct,
      ForInStatement: addDisallowedConstruct,
      ForOfStatement: addDisallowedConstruct,

      FunctionDeclaration: incrementFunctionCount,
      FunctionExpression: incrementFunctionCount,
      ArrowFunctionExpression: incrementFunctionCount,

      CallExpression(node) {
        if (disableFlags.ARRAY_LOOPS) {
          addDisallowedArrayLoops(node);
        }
      },
    });

    if (disallowedArr.length > 0) {
      isValid = false;

      error = new CustomErrorCls(
        `Disallowed JS constructs found :
       ${disallowedArr.join(", ")}. Please remove them and try again.`,
        "Your code contains disallowed JavaScript constructs.  For more information, refer to the errors tab."
      );
    } else if (disableFlags.NESTED_FUNCTIONS && functionCount > 1) {
      isValid = false;
      error = new CustomErrorCls(
        "Nested functions are not allowed",
        "Your code contains nested functions. Please remove them and try again."
      );
    }
  } catch (e: any) {
    isValid = false;
    error = e?.message || e;
  }

  if (!isValid) {
    LoggerCls.error("Error validating JS function", error);
    throw error;
  }

  return isValid;
};

function runJSFunction(
  functionString: string,
  paramsObj: any,
  skipValidation: boolean = false,
  disableFlags: DisableJsFlagsType | null = null
): any {
  let result: any | null = null;

  if (functionString) {
    paramsObj = paramsObj || {};

    // LoggerCls.log(functionString, paramsObj);

    if (!skipValidation) {
      const isValid = validateJS(functionString, disableFlags);
      LoggerCls.log("isValid function : " + isValid);
    }

    try {
      const userFunction = eval(`(${functionString})`);

      result = userFunction(paramsObj);

      //  LoggerCls.info("User function result : ", result);
    } catch (error) {
      LoggerCls.error("Error executing user function:", error);
      throw error;
    }
  }

  return result;
}

export { validateJS, runJSFunction };
