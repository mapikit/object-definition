# Object Definition
The standard library for schema and type definition in Meta-System.

## Features
This library contains the typescript type definition and two functions to both validate if your type definition is properly declared, and if a given object adheres to such object definition.

For information on how to define such objects, go to the [Meta-System Documentation](https://mapikit.github.io/meta-system-docs/docs/api-docs/configuring/object-definition).

## API Reference
### Object Definition Type
You should use this type in your application if you use Typescript and you are writing the definitions by hand in your code. To do so, just import `ObjectDefinition` from the index file of the library.

### isObjectDefinition : Function
This function validates the object definition to see if it has the correct interface. If the definition is badly formatted, the function throws.

```typescript
const goodDefinition = {/*definition here*/};
const badDefinition = {/*definition here*/};

isObjectDefinition(goodDefinition); // OK
isObjectDefinition(badDefinition); // THROWS
```

### validateObject : Function
The `validateObject` function checks whether a given object adheres to another given ObjectDefinition. The function returns an object with a property `errors`, which is an array contaning data about errors found during validation. It is empty if the object is properly delcared.

```typescript
const objectTypeDefinition = {
  name: { type: "string" },
  age: { type: "number" },
  hobbies: { type: "array", subtype: "string" }
};

const goodObject = {
  name: "John Doe",
  age: 33,
  hobbies: [ "piano", "swimming" ];
};

const badObject = {
  name: "Mary Ferry",
  age: 27,
  hobbies: [ "bowling", false ]
};

console.log(validateObject(goodObject, objectTypeDefinition))
  // { errors: [] }

console.log(validateObject(badObject, objectTypeDefinition))
  // { errors: [{ path: 'hobbies.1', error: 'Array subtype not respected: string' }] }

```
