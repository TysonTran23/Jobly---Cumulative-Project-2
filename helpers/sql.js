const { BadRequestError } = require("../expressError");

// THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql = {}) {
  //keys constant will store an array of property names (keys) from the `dataToUpdate` object
  const keys = Object.keys(dataToUpdate);
  //if there are no keys, meaning their is no date to update, a BadRequest Error is thrown
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  // we are mapping the key values from the `dataToUpdate` objects to a SQL update format
  // It first looks at the jsToSql mapping to find the same SQL column name, if none is found, it defaults to the original name
  // For each column, we create a string in the format of "column_name"=$1
  // $1 is from idx = 0 + 1 and so on
  const cols = keys.map(
    (colName, idx) => `"${jsToSql[colName] || colName}"=$${idx + 1}`
  );

  // this function return a object
  // setCols joins a list of our key values like this ["first_name=$1, "age"=$2] => "first_name=$1, "age"=$2
  // We then grab all the `values` in order from the dataToUpdate object and align the values so they can be slotted in the $1 and $2 parameters
  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };
