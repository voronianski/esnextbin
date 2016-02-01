// styling
export const HEADER_HEIGHT = 38;

// transpiling
export const BABEL_OPTIONS = {
    presets: [
        'es2015',
        'react',
        'stage-0'
    ],
    plugins: [
        'transform-object-assign',
        'transform-runtime'
    ]
};

// editors
export const CODE =
`// write ES2015 code and import modules from npm
// and then press "Execute" to run your program`;
export const HTML =
`<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>ESNextbin Sketch</title>
  <!-- put additional styles and scripts here -->
</head>
<body>
  <!-- put markup and other contents here -->
</body>
</html>`;
export const PACKAGE_JSON = `{
  "name": "esnextbin-sketch",
  "version": "0.0.0"
}`;
