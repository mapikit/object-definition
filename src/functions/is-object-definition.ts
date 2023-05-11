import { error, highlight } from "../chalk-formatting.js";
import { ObjectDefinition, TypeDefinition, TypeDefinitionUnion } from "../object-definition-type.js";
import { Errors } from "../errors.js";
import { CUSTOM_TYPES } from "../custom-types.js";

export function isObjectDefinition (input : object) : asserts input is ObjectDefinition {
  if (typeof input !== "object" || Array.isArray(input)) {
    const logObject = typeof input === "object" ? JSON.stringify(input) : input 

    throw Error(error(Errors.ExpectedObject) + ` - "${logObject}"`);
  }

  const typeDefinitions = Object.values(input);

  typeDefinitions.forEach((typeDefinition) => {
    isTypeDefinition(typeDefinition);
  })
}

function isTypeDefinitionUnion (input : Array<object>) : asserts input is TypeDefinitionUnion {
  for (let inputType of input) {
    isTypeDefinition(inputType)
  }
}

export function isTypeDefinition (input : object) : asserts input is TypeDefinition {
  const validNonReferencialTypes = [
    "object",
    "array",
    "string",
    "number",
    "boolean",
    "cloudedObject",
    "date"
  ];

  const validEspecialTypes = [
    "any",
    "enum",
    "function"
  ]

  if (Array.isArray(input)) {
    isTypeDefinitionUnion(input);
    return;
  }

  if (typeof input !== "object") {
    throw Error(error(Errors.WrongTypeObject) + ` - ${input}`);
  }

  if (typeof input["type"] !== "string") {
    throw Error(error(Errors.TypeNotString + ` - ${input["type"]}`));
  }

  const customTypeValues = Object.values(CUSTOM_TYPES);
  if (!customTypeValues.includes(input["type"])) {
    if (![...validNonReferencialTypes, ...validEspecialTypes].includes(input["type"])) {
      throw Error(error(Errors.UnknownType) + ` - "${highlight(input["type"])}"`);
    }
  }

  if (input["required"] !== undefined && typeof input["required"] !== "boolean") {
    throw Error(error(Errors.RequiredNotBoolean + ` - ${input["required"]}`));
  }

  const deepObjectTypes = ["object", "array", "enum", "function"];
  if (deepObjectTypes.includes(input["type"])) {
    if (input["type"] === "object") {
      if (typeof input["subtype"] !== "object" || Array.isArray(input["subtype"])) {
        throw Error(error(Errors.ObjectTypeSubtype))
      }

      return isObjectDefinition(input["subtype"]);
    }

    if (input["type"] === "enum") {
      const validEnumTypes = ["string", "number"]
      if (!Array.isArray(input["subtype"])) {
        throw Error(error(Errors.SubtypeNotArray))
      }

      input["subtype"].forEach((value) => {
        if (!validEnumTypes.includes(typeof value)) {
          throw Error(error(Errors.InvalidTypeOfItemInArray + ` - got "${typeof value}"`))
        }
      })

      return;
    }

    if (input["type"] === "function") {
      isObjectDefinition(input["input"]);
      isObjectDefinition(input["output"]);
      return;
    }

    if (input["subtype"] === undefined) {
      throw Error(error(Errors.SubtypeNotDefined) + ` - At "${JSON.stringify(input)}"`);
    }

    if (input["subtype"][0] !== "$") {
      if (typeof input["subtype"] === "object") {
        return isObjectDefinition(input["subtype"]);
      }

      if (!validNonReferencialTypes.includes(input["subtype"])) {
        throw Error(error(Errors.InvalidArrayType) + ` - got "${highlight(input["subtype"])}" instead`);
      }
    }
  }
}