// Request validation at the API boundary.
//
//   router.post("/add", validate({ body: addToCartBody }), addToCart);
//
// Each part (params, query, body) is parsed with its zod schema before the
// controller runs. Invalid input is rejected with 400 and never reaches
// business logic. On success the part is replaced with the parsed value, so
// controllers only ever see declared, typed, trimmed fields - unknown fields
// are rejected by the strict schemas rather than silently passed through.

const PARTS = ["params", "query", "body"];

export const validate = (schemas) => (req, res, next) => {
    const errors = [];

    for (const part of PARTS) {
        const schema = schemas[part];
        if (!schema) continue;

        const result = schema.safeParse(req[part] ?? {});
        if (!result.success) {
            for (const issue of result.error.issues) {
                errors.push({
                    location: part,
                    field: issue.path.join(".") || (issue.keys ? issue.keys.join(", ") : ""),
                    message: issue.message,
                });
            }
            continue;
        }

        req[part] = result.data;
    }

    if (errors.length > 0) {
        // Both keys: the frontend reads `msg` on auth pages and `message` elsewhere
        const summary = errors[0].message;
        return res.status(400).json({ msg: summary, message: summary, errors });
    }

    next();
};
