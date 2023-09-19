const { sqlForPartialUpdate } = require("./sql");
const { BadRequestError } = require("../expressError");

describe(`sqlForPartialUpdate`, () => {
  test(`generates correct SQL and values with jsToSql map`, () => {
    const data = { firstName: "John", age: 28 };
    const mapping = { firstName: "first_name" };
    const result = sqlForPartialUpdate(data, mapping);
    expect(result).toEqual({
      setCols: `"first_name"=$1, "age"=$2`,
      values: ["John", 28],
    });
  });
  test(`generates correct SQL without jsToSql map`, () => {
    const data = { name: "John", age: 28 };
    const result = sqlForPartialUpdate(data);
    expect(result).toEqual({
      setCols: `"name"=$1, "age"=$2`,
      values: ["John", 28],
    });
  });
});
