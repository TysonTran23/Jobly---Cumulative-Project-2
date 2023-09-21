const express = require("express");
const { BadRequestError } = require("../expressError");
const { ensureAdmin } = require("../middleware/auth");
const Job = require("../models/jobs");

const router = express.Router({ mergeParams: true });

router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    const job = await Job.create(req.body);
    return res.status(201).json({ job });
  } catch (e) {
    return next(e);
  }
});

router.get("/", async function (req, res, next) {
  let q = req.query;
  if (q.minSalary !== undefined) {
    q.minSalary = +q.minSalary;
  }
  q.hasEquity = q.hasEquity === "true";
  try {
    const jobs = await Job.findAll(q);
    return res.json({ jobs });
  } catch (e) {
    return next(e);
  }
});

router.get("/:id", async function (req, res, next) {
  try {
    const job = await Job.get(req.params.id);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
});

router.patch("/:id", ensureAdmin, async function (req, res, next) {
  try {
    const job = await Job.update(req.params.id, req.body);
    return res.json({ job });
  } catch (e) {
    return next(e);
  }
});

router.delete("/:id", ensureAdmin, async function (req, res, next) {
  try {
    await Job.remove(req.params.id);
    return res.json({ deleted: "job deleted" });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
