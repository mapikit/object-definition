import { ObjectDefinition, TypeDefinition, TypeDefinitionDeep } from "./object-definition-type.js"

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
    const listedTypes = Array.isArray(typeDefinition) ? typeDefinition : [typeDefinition];
    listedTypes.forEach((aTypeDefinition) => {
      if (deepTypesType.includes(aTypeDefinition.type)) {
        isDeepDefinition(aTypeDefinition);

        if (typeof aTypeDefinition.subtype === "string") {
          result.push(aTypeDefinition.subtype);
          return;
        }

        result.push(...getAllTypesInDefinition(aTypeDefinition.subtype));
        return;
      }

      result.push(aTypeDefinition.type)
    })
  });

  return result
}
