import { error, highlight } from "../chalk-formatting.js";
import { ObjectDefinition, TypeDefinition } from "../object-definition-type.js";
import { Errors } from "../errors.js";

export function isExtendedObjectDefinition (input : object, extendedKeysAndTypes : Array<{key : string, type : string}>)
: asserts input is ObjectDefinition {
  if (typeof input !== "object" || Array.isArray(input)) {
    const logObject = typeof input === "object" ? JSON.stringify(input) : input 

    throw Error(error(Errors.ExpectedObject) + ` - "${logObject}"`);
  }

  const typeDefinitions = Object.values(input);

  typeDefinitions.forEach((typeDefinition) => {
    isTypeDefinition(typeDefinition, extendedKeysAndTypes);
  })
}

function isTypeDefinition<T> (input : object, extendedKeysAndTypes : Array<{key : string, type : string}>)
  : asserts input is TypeDefinition<T> {
  const validNonReferencialTypes = [
    "object",
    "array",
    "string",
    "number",
    "boolean",
    "function",
    "date",
    "any",
    "cloudedObject"
  ];

  if (typeof input !== "object" || Array.isArray(input)) {
    throw Error(error(Errors.WrongTypeObject) + ` - ${input}`);
  }

  if (typeof input["type"] !== "string") {
    throw Error(error(Errors.TypeNotString + ` - ${input["type"]}`));
  }

  if (input["type"][0] !== "$") {

    if (!validNonReferencialTypes.includes(input["type"])) {
      throw Error(error(Errors.UnknownType) + ` - "${highlight(input["type"])}"`);
    }
  }

  if (input["required"] !== undefined && typeof input["required"] !== "boolean") {
    throw Error(error(Errors.RequiredNotBoolean + ` - ${input["required"]}`));
  }

  extendedKeysAndTypes.forEach((keyAndType) => {
    if (typeof input[keyAndType.key] !== keyAndType.type) {
      throw Error(error(`Required extended type not met: key "${keyAndType.key}"" is not "${keyAndType.type}"`));
    }
  })

  const deepObjectTypes = ["object", "array"];
  if (deepObjectTypes.includes(input["type"])) {
    if (input["type"] === "object" || typeof input["subtype"] === "object") {
      return isExtendedObjectDefinition(input["subtype"], extendedKeysAndTypes);
    }

    if (input["subtype"] === undefined) {
      throw Error(error(Errors.SubtypeNotDefined) + ` - At "${JSON.stringify(input)}"`);
    }

    if (input["subtype"][0] !== "$") {
      if (!validNonReferencialTypes.includes(input["subtype"])) {
        throw Error(error(Errors.UnknownType) + ` - "${highlight(input["subtype"])}"`);
      }
    }
  }
}