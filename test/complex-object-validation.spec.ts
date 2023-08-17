import { expect } from "chai";
import { validateObject } from "../src/functions/validate-object.js";
import { ObjectDefinition } from "../src/object-definition-type.js";

// Imported from http-meta-protocol - great for testing!
const myComplexTypeDefinition : ObjectDefinition = {
  "port": { "type": "number", "required": true },
  "host": { "type": "string", "required": true },
  "enableCors": { "type": "boolean" },
  "corsConfig": { "type": "object", "subtype": {
    "origin": { "type": "string", "required": true },
    "optionsSuccessStatus": { "type": "number", "required": true },
    "allowedHeaders": { "type": "string", "required": false }
  }},
  "cookieSecret": { "type": "string" },
  "routePrefix": { "type": "string" },
  "routes": { "type": "array", "required": true, "subtype": {
    "route": { "type": "string", "required": true },
    "businessOperation": { "type": "string", "required": true },
    "method": { "type": "enum", "subtype": [ "GET", "PUT", "POST", "PATCH", "DELETE" ], "required": true },
    "inputMapConfiguration": { "type": "array", "required": true, "subtype": {
      "origin": { "type": "enum", "required": true, "subtype": [ "route", "queryParams", "headers", "body" ] },
      "originPath": { "type": "string", "required": true },
      "targetPath": { "type": "string", "required": true }
    }},
    "resultMapConfiguration": { "type": "object", "required": true, "subtype": {
      "statusCode": { "type": "string", "required": true },
      "headers": { "type": "array", "required": true, "subtype": "cloudedObject" },
      "body": { "type": "cloudedObject", "required": true },
      "cookies": { "type": "array", "subtype": {
        "namePath": { "type": "string", "required": true },
        "dataPath": { "type": "string", "required": true },
        "signed": { "type": "boolean", "required": false },
        "httpOnly": { "type": "boolean", "required": false },
        "path": { "type": "string", "required": false }
      }}
    }},
    "middlewares": { "type": "array", "subtype": {
      "businessOperation": { "type": "string", "required": true },
      "inputMapConfiguration": { "type": "array", "required": true, "subtype": {
        "origin": { "type": "enum", "required": true, "subtype": [ "route", "queryParams", "headers", "body" ] },
        "originPath": { "type": "string", "required": true },
        "targetPath": { "type": "string", "required": true }
      }},
      "injectMapConfiguration": { "type":"array", "subtype": {
        "originPath": { "type": "string", "required": true },
        "targetPath": { "type": "string", "required": true }
      }},
      "interceptMapConfiguration": { "required": false, "type": "array", "subtype": {
        "shouldInterceptPath": { "type": "string", "required": true },
        "statusCode": { "type": "string", "required": true },
        "headers": { "type": "array", "required": true, "subtype": "cloudedObject" },
        "body": { "type": "cloudedObject", "required": true },
        "cookies": { "type": "array", "subtype": {
          "namePath": { "type": "string", "required": true },
          "dataPath": { "type": "string", "required": true },
          "signed": { "type": "boolean", "required": false },
          "httpOnly": { "type": "boolean", "required": false },
          "path": { "type": "string", "required": false }
        }}
      }}
    }}
  }}
}

describe("Complex Object Validation", () => {
  it("Passes missing object prop", () => {
    const object = {
      "port": 8080,
      "host": "0.0.0.0",
      "routes": []
    };

    const result = validateObject(object, myComplexTypeDefinition);
    expect(result.errors.length).to.be.equal(0);
  })
})