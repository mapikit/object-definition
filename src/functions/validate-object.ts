import { CUSTOM_TYPES, customTypesValidations } from "../custom-types.js";
import { ObjectDefinition, TypeDefinition, TypeDefinitionDeep, TypeDefinitionEnum, TypeDefinitionExecutable, TypeDefinitionFlat } from "../object-definition-type.js";

const simpleVerificationTypes = ["string", "boolean", "date", "number", "function", "cloudedObject"];
// Although function has "deep" typings we can't validate the types without actually running the function.

export type ValidationError = { path : string, error : string };
export type ValidationOutput = {
  errors : Array<ValidationError>
}

export const validateObject = (
  objectToValidate : unknown,
  definition : ObjectDefinition,
) : ValidationOutput => {
  return validationObjectCycle(objectToValidate, definition);
}

const validateForType = (typeDefinition : TypeDefinition, key : string, objectToValidate: unknown, cumulativePath = "", errors = []) => {
  if (simpleVerificationTypes.includes(typeDefinition.type)) {
    const isValid = validateFlatTypeDefinition(objectToValidate[key], typeDefinition);
    if (!isValid) {
      errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` })
    }
    return;
  }

  if (typeDefinition.type === "object") {
    const subtype = (typeDefinition as TypeDefinitionDeep).subtype as ObjectDefinition;
    const property = objectToValidate[key];
    const isObject = typeof property === "object" && !Array.isArray(property);

    if (typeDefinition.required && typeof property === "undefined") {
      errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
      return;
    }

    if (!!typeDefinition.required === false && typeof property === "undefined") {
      return;
    }

    if (!isObject) {
      errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
      return;
    }

    const computedResult = validationObjectCycle(objectToValidate[key], subtype, `${cumulativePath}${key}.`).errors;
    encapsulateRequire(
      objectToValidate[key],
      typeDefinition.required,
      computedResult.length === 0,
      computedResult,
      errors
    );

    return;
  }

  if (typeDefinition.type === "array") {
    const subtype = (typeDefinition as TypeDefinitionDeep).subtype;
    const property = objectToValidate[key];
    const isArray = Array.isArray(property);

    if (typeDefinition.required && typeof property === "undefined") {
      errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
      return;
    }

    if (!!typeDefinition.required === false && typeof property === "undefined") {
      return;
    }

    if (!isArray) {
      errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
      return;
    }

    property.forEach((element, index) => {
      if (typeof subtype === "string") {
        if (!validateFlatTypeDefinition(element, { type: subtype })) {
          errors.push({ path: `${cumulativePath}${key}.${index}`, error: `Array subtype not respected: ${subtype} - got <${typeof element}>` })
        };
        return;
      }

      errors.push(...validationObjectCycle(element, subtype, `${cumulativePath}${key}.${index}.`).errors);
    })

    return;
  }

  if (typeDefinition.type === "enum") {
    const validValues = (typeDefinition as TypeDefinitionEnum).subtype;

    encapsulateRequire(
      objectToValidate[key],
      typeDefinition.required,
      validValues.includes(objectToValidate[key]),
      [{ path: `${cumulativePath}${key}`, error: `Enum values not respected: ["${validValues.join('", "')}"] - got <${objectToValidate[key]}>` }],
      errors
    );
    
    return;
  }

  const CustomTypesList = Object.values(CUSTOM_TYPES);
  if (CustomTypesList.includes(typeDefinition.type)) {
    errors.push(...customTypesValidations[typeDefinition.type](objectToValidate[key], `${cumulativePath}${key}`).errors);
  }
}

const encapsulateRequire = (value : unknown, isRequired : boolean, rule : boolean, possibleErrors : ValidationOutput["errors"], errors: Array<{ error: string, path: string }>) =>  {
  if (isRequired) {
    if (!rule) {
      return errors.push(...possibleErrors)
    }
  }
  
  if (value !== undefined && !rule) {
    errors.push(...possibleErrors)
  }
};

// validateObject({}, {}, "", [{ path: "schemas.identifier", validator: (value) => { ;} }])

/** Validates Objects against an object definition, returning an array of errors - which may be empty if there are none.
 * 
 * This function does not support types references to other object definitions, like `"type": "$reference"`
 */
const validationObjectCycle = (
  objectToValidate : unknown,
  definition : ObjectDefinition,
  cumulativePath : string = "",
) : ValidationOutput => {
  const definitionKeys = Object.keys(definition);
  const errors : ValidationOutput["errors"] = [];

  for (const key of definitionKeys) {
    const typeDefinition = definition[key];

    if (Array.isArray(typeDefinition)) {
      let leastErrorBranch = []
      let shouldkeepValidating = true;
      typeDefinition.forEach((singleDef, index) => {
        
        const currentBranchErrors = [];
        validateForType(singleDef, key, objectToValidate, cumulativePath, currentBranchErrors);

        if (currentBranchErrors.length === 0) {
          shouldkeepValidating = false;
          leastErrorBranch = [];
          return;
        } 

        // If it is the first, we should set it doesn't matter the result
        if (currentBranchErrors.length <= leastErrorBranch.length || index === 0) {
          leastErrorBranch = currentBranchErrors;
        }
      })

      errors.push(...leastErrorBranch);
      continue;
    }

    validateForType(typeDefinition, key, objectToValidate, cumulativePath, errors);
  }

  return { errors };
}

const validateFlatTypeDefinition = (property : unknown, typeDefinition : TypeDefinitionFlat) : boolean => {
  const type = typeof property;
  const isRequired = !!typeDefinition.required;

  if (type === "undefined" && isRequired) {
    return false;
  }

  if (type === "undefined" && !isRequired) {
    return true;
  }

  if (simpleVerificationTypes.includes(type)) {
    return type === typeDefinition.type
  }

  if (typeDefinition.type === "date") {
    return property instanceof Date;
  }

  if (typeDefinition.type === "cloudedObject") {
    return type === "object" && Array.isArray(property) === false;
  }
};
