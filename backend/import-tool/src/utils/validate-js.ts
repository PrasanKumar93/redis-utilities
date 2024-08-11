import * as acorn from "acorn";
import * as walk from "acorn-walk";

import { LoggerCls, CustomErrorCls } from "./logger.js";

const disallowedJSConstructs = [
  "window",
  "document",
  "global",
  "process",
  "eval",
  "setTimeout",
  "setInterval",
  "fetch",
  "XMLHttpRequest",
  "require",
  "module",
  "exports",
  "console",
];

const hasNestedFunction = (ast: acorn.Node): boolean => {
  let nestedFunctionFound = false;

  const checkNestedFunctions = (node: acorn.Node) => {
    if (nestedFunctionFound) return;

    if (
      node.type === "FunctionDeclaration" ||
      node.type === "FunctionExpression" ||
      node.type === "ArrowFunctionExpression"
    ) {
      // Walk the children of the current function node
      walk.simple(node, {
        FunctionDeclaration(childNode) {
          nestedFunctionFound = true;
        },
        FunctionExpression(childNode) {
          nestedFunctionFound = true;
        },
        ArrowFunctionExpression(childNode) {
          nestedFunctionFound = true;
        },
      });
    }
  };

  walk.simple(ast, {
    FunctionDeclaration: checkNestedFunctions,
    FunctionExpression: checkNestedFunctions,
    ArrowFunctionExpression: checkNestedFunctions,
  });

  return nestedFunctionFound;
};

const validateJS = (code: string, disallowNestedFn: boolean): boolean => {
  let isValid = true;
  let error: any | null = null;

  try {
    // Parse the code to check for syntax errors  and generate an AST
    const ast = acorn.parse(code, { ecmaVersion: 2020 });

    // Traverse the AST to check for disallowed constructs
    const disallowedNames: string[] = [];
    walk.simple(ast, {
      Identifier(node) {
        //node?.name = variable names, function names, etc.
        if (disallowedJSConstructs.includes(node.name)) {
          disallowedNames.push(node.name);
        }
      },
    });

    if (disallowedNames.length > 0) {
      isValid = false;
      error = new CustomErrorCls(
        "Disallowed JS constructs found : " + disallowedNames.join(", "),
        "Your code contains disallowed JavaScript constructs. Please remove them and try again. For more information, refer to the errors tab."
      );
    }
    //disable loops ..etc
    // else if (disallowNestedFn) {
    //   const isNestedFn = hasNestedFunction(ast);
    //   if (isNestedFn) {
    //     isValid = false;
    //     error = new Error("Nested functions are not allowed");
    //   }
    // }
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
  disallowNestedFn: boolean = false
): any {
  let result: any | null = null;

  if (functionString) {
    paramsObj = paramsObj || {};

    LoggerCls.log(functionString, paramsObj);

    const isValid = validateJS(functionString, disallowNestedFn);

    LoggerCls.log("isValid function : " + isValid);

    try {
      const userFunction = eval(`(${functionString})`);

      result = userFunction(paramsObj);

      LoggerCls.info("User function result : ", result);
    } catch (error) {
      LoggerCls.error("Error executing user function:", error);
      throw error;
    }
  }

  return result;
}

export { validateJS, runJSFunction };
