import * as fs from "fs";
import * as uglifyJs from "uglify-js";
fs.watch("src/js/app.js", (eventType, filename) => {

    const jsCode = fs.readFileSync('src/js/app.js', 'utf-8');
    var result = uglifyJs.minify(jsCode);
    fs.writeFileSync('dist/js/app.min.js', result.code, 'utf-8');
    console.log(result);

    console.log("\nThe file", filename, "was modified!");
    console.log("The type of change was:", eventType);
});