/* oxlint-disable no-console */
/* oxlint-disable @typescript-oxlint/no-var-requires */
/* oxlint-disable no-undef */
const { exec } = require("child_process");
const { readdirSync, existsSync } = require("fs");
const fs = require("fs-extra");
// const path = require("path");

const getDirectories = (source) =>
    readdirSync(source, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

/**
 * Executes a shell command and return it as a Promise.
 * @param cmd {string}
 * @return {Promise<string>}
 */
function execAsync(cmd) {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve(stdout ? stdout : stderr);
            }
        });
    });
}

async function build() {
    // Clean previous build using fs-extra (Windows compatible)
    console.log("Clean previous build…");

    try {
        await fs.remove("./build/server");
        await fs.remove("./build/plugins");
    } catch (_err) {
        // Ignore if directories don't exist
    }

    const d = getDirectories("./plugins");

    // Compile server and shared
    console.log("Compiling…");
    await Promise.all([
        execAsync(
            "yarn babel --extensions .ts,.tsx --quiet -d ./build/server ./server"
        ),
        execAsync(
            "yarn babel --extensions .ts,.tsx --quiet -d ./build/shared ./shared"
        ),
        ...d.map(async (plugin) => {
            const hasServer = existsSync(`./plugins/${plugin}/server`);

            if (hasServer) {
                await execAsync(
                    `yarn babel --extensions .ts,.tsx --quiet -d "./build/plugins/${plugin}/server" "./plugins/${plugin}/server"`
                );
            }

            const hasShared = existsSync(`./plugins/${plugin}/shared`);

            if (hasShared) {
                await execAsync(
                    `yarn babel --extensions .ts,.tsx --quiet -d "./build/plugins/${plugin}/shared" "./plugins/${plugin}/shared"`
                );
            }
        }),
    ]);

    // Copy static files using fs-extra (Windows compatible)
    console.log("Copying static files…");
    await Promise.all([
        fs.copy("./server/collaboration/Procfile", "./build/server/collaboration/Procfile").catch(() => { }),
        fs.copy("./server/static/error.dev.html", "./build/server/error.dev.html").catch(() => { }),
        fs.copy("./server/static/error.prod.html", "./build/server/error.prod.html").catch(() => { }),
        fs.copy("package.json", "./build/package.json"),
        ...d.map(async (plugin) => {
            try {
                await fs.ensureDir(`./build/plugins/${plugin}`);
                await fs.copy(`./plugins/${plugin}/plugin.json`, `./build/plugins/${plugin}/plugin.json`);
            } catch (_err) {
                // Ignore if file doesn't exist
            }
        }),
    ]);

    // Fix shared directory structure for i18n locales
    console.log("Fixing shared directory structure…");
    const sharedI18nPath = "./build/shared/shared/i18n/locales";
    const targetI18nPath = "./build/shared/i18n/locales";

    if (await fs.pathExists(sharedI18nPath)) {
        await fs.ensureDir("./build/shared/i18n");
        await fs.copy(sharedI18nPath, targetI18nPath);
    }

    console.log("Done!");
}

void build();
