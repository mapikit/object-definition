import { isObjectDefinition } from "./functions/is-object-definition.js";
import { ValidationError, ValidationOutput } from "./functions/validate-object.js";

export const CUSTOM_TYPES = {
  OBJECT_DEFINITION: "__%objdef%__",
};

type CustomValidationFunction = (object : object, cumulativePath : string) =>  ValidationOutput

export const customTypesValidations: Record<string, CustomValidationFunction> = {
  "__%objdef%__": (object : object, path : string) => {
    let errors : ValidationError[] = [];
    try {
      isObjectDefinition(object);
    } catch (e: unknown) {
      errors.push({
        path,
        error: (e as Error).message
      })
    }

    return { errors }
  }
}; 