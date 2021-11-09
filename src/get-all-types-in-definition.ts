import { ObjectDefinition, TypeDefinition, TypeDefinitionDeep } from "./object-definition-type"

const deepTypesType = ["object", "array"];

function isDeepDefinition (typeDefinition : TypeDefinition) : asserts typeDefinition is TypeDefinitionDeep {
  if (!deepTypesType.includes(typeDefinition.type)) {
    throw TypeError("Asserted type is not a flat type definition")
  }
}

export const getAllTypesInDefinition = (objectDefinition : ObjectDefinition) : string[] => {
  const typeDefinitions = Object.values(objectDefinition);
  const result = []
  
  typeDefinitions.forEach((typeDefinition) => {
    if (deepTypesType.includes(typeDefinition.type)) {
      isDeepDefinition(typeDefinition);

      if (typeof typeDefinition.subtype === "string") {
        result.push(typeDefinition.subtype);
        return;
      }

      result.push(...getAllTypesInDefinition(typeDefinition.subtype));
      return;
    }

    result.push(typeDefinition.type)
  });

  return result
}
