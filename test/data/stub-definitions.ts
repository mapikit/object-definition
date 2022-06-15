import { ObjectDefinition } from "../../src/object-definition-type";

export const stubDefinition1 : ObjectDefinition = {
  "aProp": {
      "type": "object",
      "required": true,
      "subtype": {
          "inner": {
              "type": "array",
              "required": false,
              "subtype": {
                          "4321": {
                              "type": "number",
                              "required": false
                          },
                          "test": {
                              "type": "object",
                              "required": false,
                              "subtype": {
                                  "This is a deep test bro": {
                                      "type": "boolean",
                                      "required": false
                                  }
                              }
                          },
                          "again": {
                              "type": "date",
                              "required": false
                          }
                      }
          }
      }
  }
};

export const stubDefinition2 : ObjectDefinition = {
  "prop": {
    type: "array",
    "subtype": {
      "innerPropsInArray": { "type": "string" }
    }
  }
}

export const stubDefinitionEnum : ObjectDefinition = {
  "enumProp": {
    type: "enum",
    subtype: [ "propName1", "abcd", "test" ]
  }
}