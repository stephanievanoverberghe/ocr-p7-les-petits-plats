import * as fs from "fs";
import * as path from "path";
import * as uglifyJs from "uglify-js";

// Liste des fichiers à surveiller et minifier
const filesToMinify = [
    "src/js/app.js",
    "src/js/utils/dropdown.js",
    "src/js/api/api.js",
    "src/js/models/recipe.js"
];

// Fonction pour minifier un fichier
const minifyFile = (filePath) => {
    const jsCode = fs.readFileSync(filePath, "utf-8");
    const result = uglifyJs.minify(jsCode);

    if (result.error) {
        console.error(`Error minifying ${filePath}:`, result.error);
        return;
    }

    const outputDir = path.join("dist", "js");
    const outputFilePath = path.join(outputDir, path.basename(filePath, ".js") + ".min.js");

    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(outputFilePath, result.code, "utf-8");
    console.log(`Minified ${filePath} to ${outputFilePath}`);
};

// Minifier les fichiers au démarrage
filesToMinify.forEach(minifyFile);

// Surveillez les fichiers pour les modifications et les minifier en cas de changement
filesToMinify.forEach((filePath) => {
    fs.watch(filePath, (eventType, filename) => {
        if (eventType === "change" || eventType === "rename") {
            console.log(`The file ${filename} was modified!`);
            minifyFile(filePath);
        }
    });
});
