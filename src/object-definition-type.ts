export type AcceptedTypes = TypeDefinitionFlat["type"] | TypeDefinitionDeep["type"];

export type TypeDefinition<T = {}> = TypeDefinitionFlat & T | TypeDefinitionDeep & T
  | TypeDefinitionEnum & T | TypeDefinitionEspecial & T;

export type ObjectDefinition<T = {}> = Record<string, TypeDefinition<T>>;

export interface TypeDefinitionFlat {
  type : "string" | "function" | "number" | "boolean" | "date" | "cloudedObject" | string;
  required ?: boolean;
}

export interface TypeDefinitionEspecial {
  type : "any";
  required ?: boolean;
}

export interface TypeDefinitionDeep {
  type : "object" | "array";
  required ?: boolean;
  subtype : ObjectDefinition | TypeDefinitionFlat["type"]
}

export interface TypeDefinitionEnum {
  type : "enum";
  required ?: boolean;
  subtype : Array<string | number>;
}
