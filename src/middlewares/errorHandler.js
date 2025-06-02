const errorHandler = (err, req, res, next) => {
    console.error("Error:", err.stack);
    if (err.name === "ValidationError") {
        return res.status(400).json({
            success: false,
            error: "Invalid data",
            details: err.errors,
        });
    }

    if (err.name === "SyntaxError") {
        return res.status(400).json({
            success: false,
            error: "Invalid syntax",
            details: err.errors,
        });
    }

    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            error: "Product already exists"
        });
    }

    return res.status(500).json({
        success: false,
        error: "Internal Server Error"
    });
};

module.exports = errorHandler;