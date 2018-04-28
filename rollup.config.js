import babel from "rollup-plugin-babel";

export default {
  input: "src/index.js",
  output: {
    file: "dist/xbossdebug.js",
    format: "umd",
    name: "XbossDebug"
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    })
  ]
};
