import { ObjectDefinition } from "../src/object-definition-type.js";
import { isObjectDefinition } from "../src/functions/is-object-definition.js";
import { validateObject } from "../src/functions/validate-object.js";
import { expect } from "chai";
import { stubDefinitionFunction } from "./data/stub-definitions.js";

const templateObjDefinition1 : ObjectDefinition = {
  property1: { type: "string", required: false },
  property2: { type: "date" },
  property3: { type: "number", required: true }
};

const templateObjDefinition2 : ObjectDefinition = {
  prop1: { type: "array", subtype: "number" },
  prop2: { type: "cloudedObject" },
  prop3: { type: "function" }
}

const templateObjDefinition3 : ObjectDefinition = {
  prop1: { type: "object", subtype: {
      insideProp: { type: "string", required: true }
    }
  },
  prop2: { type: "array", subtype: {
      arrayInsideProp: { type: "object", required: false, subtype: {
        anotherInsideProp: { type: "number"}
      }}
    }
  }
}

const templateObjDefinition4 : ObjectDefinition = {
  deepProp : { type: "object", subtype: {
    innerpropEnum: { type: "enum", subtype: ["1", "2", "3"] }
  } }
}

const badTemplateDefinition = {
  propName1: "string"
};

const badTemplateDefinition2 = {
  prop1: { type: "unkownType" }
};

const badTemplateDefinition3 = {
  prop1: { type: "object", subtype: "string" }
};

const badTemplateDefinition4 = {
  prop1: { type: "number", required: "true" }
};

const badTemplateDefinition5 = {
  prop1: { type: "object", required: false } // missing subtype
}

const badTemplateDefinition6 = {
  prop1: { type: "enum" }
}

const goodObjectDefinitions : ObjectDefinition[] = [
  templateObjDefinition1,
  templateObjDefinition2,
  templateObjDefinition3,
  templateObjDefinition4
];

const badObjectDefinitions : object[] = [
  badTemplateDefinition,
  badTemplateDefinition2,
  badTemplateDefinition3,
  badTemplateDefinition4,
  badTemplateDefinition5,
  badTemplateDefinition6
];

describe("Object Definition Validation", () => {
  goodObjectDefinitions.forEach((def, index) => {
    it(`Passes Object definition for valid template (${index + 1})`, () => {
      expect(isObjectDefinition.bind({}, def)).to.not.throw;
    });
  });

  badObjectDefinitions.forEach((def, index) => {
    it(`Fails Object definition for invalid template (${index + 1})`, () => {
      expect(isObjectDefinition.bind({}, def)).to.throw;
    });
  })
});

describe("Validation of objects against their type definitions", () => {
  it("Succeeds validation for valid object", () => {
    const objectToBeValidated = {
      name: "Roger Connor",
      age: 24,
      married: false,
      job: {
        weeksEmployed: 35,
        name: "Delivery Guy",
        employmentStart: new Date()
      },
      hobbies: [
        "Gaming", "Guitar", "Bowling"
      ]
    };

    const schema = {
      name: { type: "string" },
      age: { type: "number", required: true },
      married: { type: "boolean" },
      job: { type: "object", required: true, subtype: {
        weeksEmployed: { type: "number" },
        name: { type: "string" },
        employmentStart: { type: "date", required: false },
        employmentEnd: { type: "date", required: false }
      }},
      hobbies: { type: "array", subtype: "string" }
    };

    const result = validateObject(objectToBeValidated, schema);

    expect(result.errors.length).to.equal(0);
  });

  it("Succeeds validation for valid object", () => {
    const objectToBeValidated = {
      name: "Roger Connor",
      age: 24,
      married: 1,
      job: { // Ommited weeks employed, should not throw
        name: "Delivery Guy",
        employmentStart: "potato",
        employmentEnd: true
      },
      hobbies: [
        "Gaming", "Guitar", "Bowling", 24
      ]
    };

    const schema = {
      name: { type: "string" },
      age: { type: "number", required: true },
      married: { type: "boolean" },
      job: { type: "object", required: true, subtype: {
        weeksEmployed: { type: "number" },
        name: { type: "string" },
        employmentStart: { type: "date", required: false },
        employmentEnd: { type: "date", required: true }
      }},
      hobbies: { type: "array", subtype: "string" }
    };

    const result = validateObject(objectToBeValidated, schema);
    const expectedErrorsPaths = [
      "married",
      "job.employmentStart",
      "job.employmentEnd",
      "hobbies.3"
    ];

    expect(result.errors.length).to.equal(4);
    expectedErrorsPaths.forEach((errorPath) => {
      expect(result.errors.find((error) => errorPath === error.path)).to.not.be.undefined;
    })
  });

  it("Test Function Validation", () => {
    const object = {
      funcProp: () => {}
    }

    const result = validateObject(object, stubDefinitionFunction);

    expect(result.errors.length).to.equal(0);
  })

  it("Custom Type Validation - Success", () => {
    const definition : ObjectDefinition = {
      format: { "type": "__%objdef%__", required: true },
      name: { "type": "string" }
    }

    const goodObject = {
      format: { "myKey": { "type": "number", required: true } },
      name: "goodObject"
    }

    const result = validateObject(goodObject, definition);

    expect(result.errors.length).to.be.equal(0);
  })

  it("Custom Type Validation - Failure", () => {
    const definition : ObjectDefinition = {
      format: { "type": "__%objdef%__", required: true },
      key: { "type": "object", subtype: {
        deepFormat: {
          type: "__%objdef%__", required: true,
        }
      }}
    }

    const badObject = {
      format: {
        "myKey": { "type": "number", required: true },
        "wrongKey": "i'm wrong here"
      },
      key: {
        deepFormat: {
          "anotha": { "type": "string" },
          "wrongHere": true
        }
      }
    }

    const result = validateObject(badObject, definition);

    expect(result.errors.length).to.be.equal(2);
    expect(result.errors[0].path).to.be.equal("format");
    expect(result.errors[1].path).to.be.equal("key.deepFormat");
  });

  describe.only("Custom Type Validation + Type Union", () => {
    const definition : ObjectDefinition = {
      key: { "type": "object", subtype: {
        deepFormat: [{
          type: "__%objdef%__", required: true,
        }, { type: "string", required: false }]
      }}
    }

    const badObject1 = {
      key: {
        deepFormat: {
          "anotha": { "type": "string" },
          "wrongHere": true
        }
      }
    }

    const badObject2 = {
      key: {
        deepFormat: true
      }
    }

    const goodObject1 = {
      key: {}
    }

    const goodObject2 = {
      key: {
        deepFormat: "hello"
      }
    }

    it("BadObject 1", () => {
      const result = validateObject(badObject1, definition);

      expect(result.errors.length).to.be.equal(1);
      expect(result.errors[0].path).to.be.equal("key.deepFormat");
    });

    it("BadObject 2", () => {
      const result = validateObject(badObject2, definition);

      expect(result.errors.length).to.be.equal(1);
      expect(result.errors[0].path).to.be.equal("key.deepFormat");
      expect(result.errors[0].error).to.be.equal("Type not respected: string - got <boolean>");
    });

    it("Good Object 1", () => {
      const result = validateObject(goodObject2, definition);

      expect(result.errors.length).to.be.equal(0);
    });

    it("Good Object 2", () => {
      const result = validateObject(goodObject1, definition);

      expect(result.errors.length).to.be.equal(0);
    });
  })
});

describe("Type Union validation", () => {
  it("Shallow Type union validation", (() => {
    const unionObjDef : ObjectDefinition = {
      prop: [
        { type: "string" },
        { type: "number" }
      ]
    };

    const objects = [
      { prop: "hello" },
      { prop: 22 },
      { prop: true }
    ];

    const errors = new Map()
    objects.forEach((obj, index) => {
      errors.set(index, validateObject(obj, unionObjDef).errors)
    });
    expect(errors.get(2)[0].path).to.be.equal('prop')
  }))
})