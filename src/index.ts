import { AcceptedTypes, ObjectDefinition, TypeDefinition } from "./object-definition-type.js";
import { isObjectDefinition } from "./functions/is-object-definition.js";
import { validateObject } from "./functions/validate-object.js";
import { getAllTypesInDefinition } from "./get-all-types-in-definition.js";
import { isExtendedObjectDefinition } from "./functions/is-extended-object-definition.js";

export {
  isObjectDefinition,
  isExtendedObjectDefinition,
  getAllTypesInDefinition,
  validateObject,
  AcceptedTypes,
  ObjectDefinition,
  TypeDefinition,
}
