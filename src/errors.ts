export enum Errors {
  ExpectedObject = "ObjectDefinition provided should be an object",
  WrongTypeObject = "Value of Object should be a TypeDefinition",
  TypeNotString = "Property \"type\" must be a string",
  UnknownType = "Given value is not a known Type",
  RequiredNotBoolean = "If present, the property \"required\" must be a boolean",
  SubtypeNotDefined = "Property \"subtype\" must be defined for deep types (array or object)",
  InvalidArrayType = "Subtype for array not valid - must be one of the values: 'string', 'boolean', 'number', 'object', 'date', or 'function'",
  SubtypeNotArray = "Subtype of ENUM should be an Array",
  InvalidTypeOfItemInArray = "Subtype array contains an item with an invalid type",
  ObjectTypeSubtype = "Expected subtype for type object should be an object"
}