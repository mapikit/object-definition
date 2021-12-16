import { AcceptedTypes, ObjectDefinition, TypeDefinition } from "./src/object-definition-type";
import { isObjectDefinition } from "./src/functions/is-object-definition";
import { validateObject } from "./src/functions/validate-object";
import { getAllTypesInDefinition } from "./src/get-all-types-in-definition";
import { isExtendedObjectDefinition } from "./src/functions/is-extended-object-definition";

export {
  isObjectDefinition,
  isExtendedObjectDefinition,
  getAllTypesInDefinition,
  validateObject,
  AcceptedTypes,
  ObjectDefinition,
  TypeDefinition,
}
