const HttpError = require("../utils/httpError");
module.exports = (schema) => (req, _res, next) => {
  const parsed = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query,
  });
  if (!parsed.success)
    return next(
      new HttpError(
        400,
        "Validation failed",
        parsed.error.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      ),
    );
  req.validated = parsed.data;
  next();
};
