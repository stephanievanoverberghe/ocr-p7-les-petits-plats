import * as fs from "fs";
import * as path from "path";
import * as uglifyJs from "uglify-js";

// List of files to watch and minify
const filesToMinify = [
    "src/js/app.js",
    "src/js/utils/dropdown.js",
    "src/js/api/api.js",
    "src/js/models/recipe.js"
];

/**
 * Minifies a JavaScript file and saves the minified version to the 'dist/js' directory.
 * @param {string} filePath - The path of the JavaScript file to be minified.
 */
const minifyFile = (filePath) => {
    // Read the content of the JavaScript file
    const jsCode = fs.readFileSync(filePath, "utf-8");

    // Minify the JavaScript code
    const result = uglifyJs.minify(jsCode);

    // Handle any errors during minification
    if (result.error) {
        console.error(`Error minifying ${filePath}:`, result.error);
        return;
    }

    // Construct the output path for the minified file
    const outputDir = path.join("dist", "js");
    const outputFilePath = path.join(outputDir, path.basename(filePath, ".js") + ".min.js");

    // Create the output directory if it does not exist
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write the minified code to the output file
    fs.writeFileSync(outputFilePath, result.code, "utf-8");
    console.log(`Minified ${filePath} to ${outputFilePath}`);
};

// Minify the files on initial execution of the script
filesToMinify.forEach(minifyFile);

/**
 * Watches the files for changes and triggers minification if any changes are detected.
 * @param {string} filePath - The path of the file to watch.
 */
filesToMinify.forEach((filePath) => {
    fs.watch(filePath, (eventType, filename) => {
        if (eventType === "change" || eventType === "rename") {
            console.log(`The file ${filename} was modified!`);
            minifyFile(filePath);
        }
    });
});