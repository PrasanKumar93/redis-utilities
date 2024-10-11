import { z } from "zod";

import { getFileKey } from "./import/common-import.js";
import { DISABLE_JS_FLAGS } from "../utils/constants.js";
import { runJSFunction } from "../utils/validate-js.js";

import * as InputSchemas from "../input-schema.js";

const testJSONFormatterFn = async (
  input: z.infer<typeof InputSchemas.testJSONFormatterFnSchema>
) => {
  InputSchemas.testJSONFormatterFnSchema.parse(input); // validate input

  let sampleKey = "";
  let functionResult: any = "";

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

  // throws error if idField is not present in paramsObj
  sampleKey = getFileKey({
    idField: input.idField,
    content: functionResult || input.paramsObj,
    keyPrefix: input.keyPrefix,
    index: 0,
  });

  return {
    functionResult,
    sampleKey,
  };
};

export { testJSONFormatterFn };
