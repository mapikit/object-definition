export type AcceptedTypes = TypeDefinitionFlat["type"] | TypeDefinitionDeep["type"];

export type TypeDefinition<T = {}> = TypeDefinitionFlat & T | TypeDefinitionDeep & T
  | TypeDefinitionEnum & T | TypeDefinitionEspecial & T | TypeDefinitionExecutable & T;

export type ObjectDefinition<T = {}> = Record<string, TypeDefinition<T> | TypeDefinitionUnion<T>>;

export type TypeDefinitionUnion<T = {}> = Array<TypeDefinition<T>>

export interface TypeDefinitionFlat {
  type : "string" | "number" | "boolean" | "date" | "cloudedObject" | string;
  required ?: boolean;
}

export interface TypeDefinitionEspecial {
  type : "any";
  required ?: boolean;
}

export interface TypeDefinitionExecutable {
  type : "function";
  input : ObjectDefinition;
  output : ObjectDefinition;
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
