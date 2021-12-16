export type AcceptedTypes = TypeDefinitionFlat["type"] | TypeDefinitionDeep["type"];

export type TypeDefinition<T = {}> = TypeDefinitionFlat & T | TypeDefinitionDeep & T;

export type ObjectDefinition<T = {}> = Record<string, TypeDefinition<T>>;

export interface TypeDefinitionFlat {
  type : "string" | "function" | "number" | "boolean" | "date" | "any" | "cloudedObject" | string;
  required ?: boolean;
}

export interface TypeDefinitionDeep {
  type : "object" | "array";
  required ?: boolean;
  subtype : ObjectDefinition | TypeDefinitionFlat["type"]
}
