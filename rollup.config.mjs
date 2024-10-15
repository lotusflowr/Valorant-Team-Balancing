import { babel } from "@rollup/plugin-babel";
import { nodeResolve } from "@rollup/plugin-node-resolve";

const extensions = [ ".js" ];

const preventTreeShakingPlugin = () => {
  return {
    name: "no-treeshaking",
    resolveId(id, importer) {
      if (!importer) {
        return {id, moduleSideEffects: "no-treeshake" }
      }
      return null;
    }
  }
}

export default {
  input: 'src/main.js',
  output: {
    file: 'dist/bundle.js',
    name: 'GalorantsInHouses',
    format: 'esm'
  },
  plugins: [
    preventTreeShakingPlugin(),
    nodeResolve({
      extensions
    }),
    babel({
      extensions,
      babelHelpers: "runtime",
      skipPreflightCheck: true
    })
  ]
};
