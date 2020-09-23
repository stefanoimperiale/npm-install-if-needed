# npm-install-if-needed
Node.js script to check if a project needs to run `npm install`

### Usage
The script has no package-dependency, so you can use it even in every scenario.

When running the first time, the script adds `semver` as dev dependency in your package.json file. 
You can import the script with `require` directive and run
```
const npm_if_needed = require('./npm-install-if-needed');
npm_if_needed.installIfNeeded();
```
Or with options:
```
npm_if_needed.installIfNeeded({cwd: process.cwd(), ignoreScript:false, saveDev:true, packages:[]});
```

### Options
You can pass some options to the function `installIfNeeded`:
- cwd: the current work directory when `package.json` file is located (default: `process.cwd()`)
- ignoreScript: if true, add `--ignore-scripts` flag to npm install command (default: `false`)
- saveDev: if true, add `--save-dev` flag to npm install command (default: `false`)
- packages: array of npm packages to install when run the npm command (default: `[]`)
