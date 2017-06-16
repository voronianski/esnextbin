const deps = {}; // put dependencies from package.json here

console.log(Object.keys(deps).map(dep => `${dep}@latest`).join(' '));
