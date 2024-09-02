import { z } from "zod";

import { DISABLE_JS_FLAGS } from "../utils/constants.js";
import { runJSFunction } from "../utils/validate-js.js";

import * as InputSchemas from "../input-schema.js";

const testJSONFormatterFn = async (
  input: z.infer<typeof InputSchemas.testJSONFormatterFnSchema>
) => {
  InputSchemas.testJSONFormatterFnSchema.parse(input); // validate input

  let disableFlags = DISABLE_JS_FLAGS;
  //disableFlags.NAMES_CONSOLE = false; // allow console.log

  const functionResult = await runJSFunction(
    input.jsFunctionString,
    input.paramsObj,
    false,
    disableFlags
  );

  return functionResult;
};

export { testJSONFormatterFn };
