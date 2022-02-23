import { ObjectDefinition, TypeDefinitionDeep, TypeDefinitionEnum, TypeDefinitionFlat } from "../object-definition-type";

const simpleVerificationTypes = ["string", "boolean", "date", "number", "function", "cloudedObject"];

type ValidationOutput = {
  errors : Array<{ path : string, error : string }>
}

/** Validates Objects against an object definition, returning an array of errors - which may be empty if there are none.
 * 
 * This function does not support types references to other object definitions, like `"type": "$reference"`
 */
export const validateObject = (
  objectToValidate : unknown,
  definition : ObjectDefinition,
  cumulativePath : string = "",
) : ValidationOutput => {
  const definitionKeys = Object.keys(definition);
  const errors : ValidationOutput["errors"] = [];

  const encapsulateRequire = (value : unknown, isRequired : boolean, rule : boolean, possibleErrors : ValidationOutput["errors"]) =>  {
    if (isRequired) {
      if (!rule) {
        return errors.push(...possibleErrors)
      }
    }
    
    if (value !== undefined && !rule) {
      errors.push(...possibleErrors)
    }
  };

  for (const key of definitionKeys) {
    const typeDefinition = definition[key];

    if (simpleVerificationTypes.includes(typeDefinition.type)) {
      const isValid = validateFlatTypeDefinition(objectToValidate[key], typeDefinition);
      if (!isValid) {
        errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` })
      }
      continue;
    }

    if (typeDefinition.type === "object") {
      const subtype = (typeDefinition as TypeDefinitionDeep).subtype as ObjectDefinition;
      const computedResult = validateObject(objectToValidate[key], subtype, `${cumulativePath}${key}.`).errors;
      encapsulateRequire(
        objectToValidate[key],
        typeDefinition.required,
        computedResult.length === 0,
        computedResult
      );

      continue;
    }

    if (typeDefinition.type === "array") {
      const subtype = (typeDefinition as TypeDefinitionDeep).subtype;
      const property = objectToValidate[key];
      const isArray = Array.isArray(property);

      if (typeDefinition.required && typeof property === "undefined") {
        errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
        continue;
      }

      if (!!typeDefinition.required === false && typeof property === "undefined") {
        continue;
      }

      if (!isArray) {
        errors.push({ path: `${cumulativePath}${key}`, error: `Type not respected: ${typeDefinition.type} - got <${typeof objectToValidate[key]}>` });
        continue;
      }

      property.forEach((element, index) => {
        if (typeof subtype === "string") {
          if (!validateFlatTypeDefinition(element, { type: subtype })) {
            errors.push({ path: `${cumulativePath}${key}.${index}`, error: `Array subtype not respected: ${subtype} - got <${typeof element}>` })
          };
          return;
        }

        errors.push(...validateObject(element, subtype, `${cumulativePath}${key}.${index}.`).errors);
      })

      continue;
    }

    if (typeDefinition.type === "enum") {
      const validValues = (typeDefinition as TypeDefinitionEnum).subtype;

      encapsulateRequire(
        objectToValidate[key],
        typeDefinition.required,
        validValues.includes(objectToValidate[key]),
        [{ path: `${cumulativePath}${key}`, error: `Enum values not respected: ["${validValues.join('", "')}"] - got <${objectToValidate[key]}>` }]
      )
    }
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
