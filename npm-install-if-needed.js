const child_process = require('child_process')
const fs = require('fs');


function installIfNeeded(options = {}) {
  const {cwd = process.cwd()} = options
  const content = fs.readFileSync('./package.json', 'utf-8')
  const pkg = JSON.parse(content)
  const needed = needsInstall(pkg, cwd)
  if (needed) {
    npmInstallAt(options)
  }
  return needed
}

function npmInstallAt(options = {}) {
  const {cwd = process.cwd(), ignoreScript = false, saveDev=false, packages=[]} = options
  const command = `npm install ${packages.length > 0 ? packages.join(' ') : ''} ${saveDev? '--save-dev': ''} ${ignoreScript ? '--ignore-scripts' : ''}`;
  child_process.execSync(command,
    {
      stdio: [0, 1, 2],
      cwd: cwd
    });
}

function readFileAsJSON(filename) {
  try {
    return JSON.parse(fs.readFileSync(filename, 'utf-8'))
  } catch (e) {
    console.warn(`[install-if-needed] Failed to read json`, filename)
    return null
  }
}

function modulePackagePath(name, cwd) {
  const moduleIds = [
    `${cwd}/node_modules/${name}/package.json`,
    `${name}/package.json`,
    `node_modules/${name}/package.json`,
  ]
  for (const moduleId of moduleIds) {
    try {
      return require.resolve(moduleId)
    } catch (e) {
    }
  }
  console.debug('Not found', {name, cwd, moduleIds})
  return null
}

function needsInstall(pkg, cwd) {
  const deps = {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {})
  }

  //check node modules
  let foundNodeModules;
  try {
    fs.statSync(`${cwd}/node_modules`)
    foundNodeModules = true;
  } catch (_) {
    foundNodeModules = false;
  }

  if (!foundNodeModules) {
    console.debug('Not found node_modules')
    return true
  }

  let semver;
  try {
    semver = require("semver");
  } catch (e) {
    if (e.code === 'MODULE_NOT_FOUND') {
      npmInstallAt({cwd, saveDev: true, packages:['semver']});
      semver = require("semver");
    } else throw e;
  }


  //check if every dependency is satisfied
  for (const [name, version] of Object.entries(deps)) {
    const modulePackagePath_ = modulePackagePath(name, cwd)
    if (!modulePackagePath_) {
      return true;
    }

    // check semantic versioned
    const isSemver = Boolean(semver.valid(version) || semver.validRange(version))
    if (isSemver) {
      const pkg_module = readFileAsJSON(modulePackagePath_)
      const ok = !!pkg_module && semver.satisfies(pkg_module.version, version, {loose: true})
      if (!ok) {
        console.debug('Not specified', name, version)
        return true;
      }
    }
  }
  return false
}

module.exports = {
  installIfNeeded
}
