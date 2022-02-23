import { expect } from "chai";
import { isObjectDefinition } from "../src/functions/is-object-definition";
import { validateObject } from "../src/functions/validate-object";

describe("Arrays", () => {
  it("Arrays of ANY should not be valid", () => {
    const objDef = {
      "arrParam" : { type: "array", subtype: "any" }
    }

    const validation = () => isObjectDefinition(objDef);

    expect(validation).to.throw();
  });
  it("Arrays of cloudedObject should not be valid", () => {
    const objDef = {
      "arrParam" : { type: "array", subtype: "cloudedObject" }
    }

    const validation = () => isObjectDefinition(objDef);

    expect(validation).to.throw();
  });
  it("Arrays of any other valid type should be valid", () => {
    const objDef = {
      "arrParam" : { type: "array", subtype: "string" }
    }

    const validation = () => isObjectDefinition(objDef);

    expect(validation).to.not.throw();
  });
})

describe("ENUMs", () => {
  it("Valid Enum validates correctly", () => {
    const objDef = {
      "enumParam": { type: "enum", subtype: ["opt1", "opt2", 3, "otp4"] }
    }

    const validation = () => isObjectDefinition(objDef);

    expect(validation).to.not.throw();
  });
  it("Invalid Enum fails validation", () => {
    const objDef = {
      "enumParam": { type: "enum", subtype: [false, "opt2", 3, "otp4"] }
    }

    const validation = () => isObjectDefinition(objDef);

    expect(validation).to.throw();
  });
  it("Validate valid enum against its definition", () => {
    const objDef = {
      "status": { type: "enum", subtype: ["created", "running", "stopped"] }
    }

    const validObjectList = [
      { "status": "created" },
      { "status": "stopped" },
      { "status": "running" }
    ];

    let errors = [];

    validObjectList.forEach((obj) => {
      errors.push(...validateObject(obj, objDef).errors);
    });

    expect(errors.length).to.be.equal(0)
  });
  it("Validate invalid enum against its definition", () => {
    const objDef = {
      "status": { type: "enum", subtype: ["created", "running", "stopped"] }
    }

    const validObjectList = [
      { "status": false },
      { "status": "stopped" },
      { "status": "running" }
    ];

    let errors = [];

    validObjectList.forEach((obj) => {
      errors.push(...validateObject(obj, objDef).errors);
    });

    expect(errors[0].path).to.be.equal("status")
  });

  it("Validates missing enum not required", () => {
    const objDef = {
      "status": { type: "enum", subtype: ["created", "running", "stopped"] }
    }

    const validObjectList = [
      {},
      {},
      { "status": "Rice is nice" }
    ];

    let errors = [];

    validObjectList.forEach((obj) => {
      errors.push(...validateObject(obj, objDef).errors);
    });

    expect(errors.length).to.be.equal(1)
  });
});
