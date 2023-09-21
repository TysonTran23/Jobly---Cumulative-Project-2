"use strict";

const db = require("../db");
const { NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

class Job {
  static async create(data) {
    const result = await db.query(
      `
        INSERT INTO jobs (title,
                        salary,
                        equity,
                        company_handle)
        VALUES ($1,$2,$3,$4)
        RETURNING id, title, salary, equity, company_handle AS "companyHandle"
        `,
      [data.title, data.salary, data.equity, data.company_handle]
    );
    let job = result.rows[0];
    return job;
  }

  static async findAll({ title, minSalary, hasEquity }) {
    let baseQuery = `
    SELECT 
    title, 
    salary, 
    equity, 
    company_handle AS "companyHandle"
    FROM jobs;
    `;
    let queryFilters = [];
    let queryValues = [];

    if (title) {
      queryFilters.push(`title ILIKE $${queryValues.length + 1}`);
      queryValues.push(`%${title}%`);
    }

    if (minSalary) {
      queryFilters.push(`salary >= $${queryValues.length + 1}`);
      queryValues.push(minSalary);
    }

    if (hasEquity === "true") {
      queryFilters.push(`equity > 0`);
    }

    if (queryFilters.length > 0) {
      baseQuery += " WHERE " + queryFilters.join(" AND ");
    }
    const results = await db.query(baseQuery, queryValues);
    return results.rows;
  }

  static async get(id) {
    const result = await db.query(
      `
    SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE id = $1
    `,
      [id]
    );
    const job = result.rows[0];
    if (!job) {
      throw new NotFoundError(`No job: ${id}`);
    }
    const companiesRes = await db.query(
      `SELECT handle,
                name,
                description,
                num_employees AS "numEmployees",
                logo_url AS "logoUrl"
         FROM companies
         WHERE handle = $1`,
      [job.companyHandle]
    );

    delete job.companyHandle;
    job.company = companiesRes.rows[0];

    return job;
  }

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(data, {});
    const Idx = "$" + (values.length + 1);

    const querySql = `UPDATE jobs
                        SET ${setCols}
                        WHERE id = ${Idx}
                        RETURNING id,
                                    title,
                                    salary,
                                    equity,
                                    company_handle AS "companyHandle"`;
    const result = db.query(querySql, [...values, id]);
    const job = result.rows[0];
    if (!job) {
      throw new NotFoundError(`No job: ${id}`);
    }
    return job;
  }

  static async remove(id) {
    const result = await db.query(
      `
    DELETE FROM jobs
    WHERE id = $1
    RETURNING id
    `,
      [id]
    );
    const job = result.rows[0];
    if (!job) throw new NotFoundError(`No job: ${id}`);
  }
}

module.exports = Job;
