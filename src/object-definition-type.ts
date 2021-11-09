export type AcceptedTypes = TypeDefinitionFlat["type"] | TypeDefinitionDeep["type"];

export type TypeDefinition = TypeDefinitionFlat | TypeDefinitionDeep;

export type ObjectDefinition = Record<string, TypeDefinition>;

export interface TypeDefinitionFlat {
  type : "string" | "function" | "number" | "boolean" | "date" | "any" | "cloudedObject" | string;
  required ?: boolean;
}

export interface TypeDefinitionDeep {
  type : "object" | "array";
  required ?: boolean;
  subtype : ObjectDefinition | TypeDefinitionFlat["type"]
}
