module.exports = {
    env: {
        browser: true,
        es2021: true,
    },
    extends: "eslint:recommended",
    overrides: [],
    parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
    },
    rules: {
        "no-inner-declarations": "off",
        "no-unused-vars": "warn",
        "no-debugger": "warn",
    },
};
