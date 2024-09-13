import { z } from "zod";

import { getFileKey } from "./import/common-import.js";
import { DISABLE_JS_FLAGS } from "../utils/constants.js";
import { runJSFunction } from "../utils/validate-js.js";

import * as InputSchemas from "../input-schema.js";

const testJSONFormatterFn = async (
  input: z.infer<typeof InputSchemas.testJSONFormatterFnSchema>
) => {
  InputSchemas.testJSONFormatterFnSchema.parse(input); // validate input

  let functionResult: any = "";

  if (input.idField) {
    // throws error if idField is not present in paramsObj
    getFileKey({
      idField: input.idField,
      content: input.paramsObj,
      keyPrefix: input.keyPrefix,
    });
  }

  if (input.jsFunctionString) {
    let disableFlags = DISABLE_JS_FLAGS;
    //disableFlags.NAMES_CONSOLE = false; // allow console.log

    functionResult = await runJSFunction(
      input.jsFunctionString,
      input.paramsObj,
      false,
      disableFlags
    );
  }

  return functionResult;
};

export { testJSONFormatterFn };
