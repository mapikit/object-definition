import { error, highlight } from "../chalk-formatting";
import { ObjectDefinition, TypeDefinition } from "../object-definition-type";
import { Errors } from "../errors";

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

export function isTypeDefinition (input : object) : asserts input is TypeDefinition {
  const validNonReferencialTypes = [
    "object",
    "array",
    "string",
    "number",
    "boolean",
    "function",
    "cloudedObject",
    "date"
  ];

  const validEspecialTypes = [
    "any",
    "enum"
  ]

  if (typeof input !== "object" || Array.isArray(input)) {
    throw Error(error(Errors.WrongTypeObject) + ` - ${input}`);
  }

  if (typeof input["type"] !== "string") {
    throw Error(error(Errors.TypeNotString + ` - ${input["type"]}`));
  }

  if (input["type"][0] !== "$") {

    if (![...validNonReferencialTypes, ...validEspecialTypes].includes(input["type"])) {
      throw Error(error(Errors.UnknownType) + ` - "${highlight(input["type"])}"`);
    }
  }

  if (input["required"] !== undefined && typeof input["required"] !== "boolean") {
    throw Error(error(Errors.RequiredNotBoolean + ` - ${input["required"]}`));
  }

  const deepObjectTypes = ["object", "array", "enum"];
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