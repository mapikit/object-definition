export enum Errors {
  ExpectedObject = "ObjectDefinition provided should be an object",
  WrongTypeObject = "Value of Object should be a TypeDefinition",
  TypeNotString = "Property \"type\" must be a string",
  UnknownType = "Given value is not a known Type",
  RequiredNotBoolean = "If present, the property \"required\" must be a boolean",
  SubtypeNotDefined = "Property \"subtype\" must be defined for deep types (array or object)"
}