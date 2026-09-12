const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

function patchFile(filePath, isReactNamespace) {
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');

  // 1. Add pendingUnhandledLinkRef and useEffect if not present
  const refDeclare = isReactNamespace
    ? 'const getActionFromStateRef = React.useRef(getActionFromState);'
    : 'const getActionFromStateRef = (0, react_1.useRef)(getActionFromState);';

  const refWithEffect = isReactNamespace
    ? `const getActionFromStateRef = React.useRef(getActionFromState);
    const pendingUnhandledLinkRef = React.useRef();
    React.useEffect(() => {
        if (pendingUnhandledLinkRef.current !== undefined) {
            onUnhandledLinking(pendingUnhandledLinkRef.current);
            pendingUnhandledLinkRef.current = undefined;
        }
    });`
    : `const getActionFromStateRef = (0, react_1.useRef)(getActionFromState);
    const pendingUnhandledLinkRef = (0, react_1.useRef)();
    (0, react_1.useEffect)(() => {
        if (pendingUnhandledLinkRef.current !== undefined) {
            onUnhandledLinking(pendingUnhandledLinkRef.current);
            pendingUnhandledLinkRef.current = undefined;
        }
    });`;

  if (!content.includes('pendingUnhandledLinkRef') && content.includes(refDeclare)) {
    content = content.replace(refDeclare, refWithEffect);
  }

  // 2. In getInitialState, replace the setTimeout or direct call with setting the ref
  const extractFn = isReactNamespace
    ? '(0, extractPathFromURL_1.extractPathFromURL)'
    : '(0, extractPathFromURL_1.extractExpoPathFromURL)';

  const timeoutPatternRegex = new RegExp(
    `setTimeout\\(\\(\\) => \\{\\s*onUnhandledLinking\\(${extractFn.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\(prefixes, url\\)\\);\\s*\\}, 0\\);`,
    'g'
  );
  const directPattern = `onUnhandledLinking(${extractFn}(prefixes, url));`;
  const safeReplacement = `pendingUnhandledLinkRef.current = ${extractFn}(prefixes, url);`;

  const getInitialStateIdx = content.indexOf('const getInitialState =');
  const getInitialStateEndIdx = content.indexOf('return thenable;', getInitialStateIdx);

  if (getInitialStateIdx !== -1 && getInitialStateEndIdx !== -1) {
    let before = content.slice(0, getInitialStateIdx);
    let gis = content.slice(getInitialStateIdx, getInitialStateEndIdx);
    let after = content.slice(getInitialStateEndIdx);

    gis = gis.replace(/setTimeout\(\(\)\s*=>\s*\{\s*(pendingUnhandledLinkRef\.current\s*=[^;]+;)\s*\}, 0\);/g, '$1');
    gis = gis.replace(/setTimeout\(\(\)\s*=>\s*\{\s*onUnhandledLinking\([^;]+\);\s*\}, 0\);/g, safeReplacement);
    gis = gis.replaceAll(directPattern, safeReplacement);

    content = before + gis + after;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`[patch-expo-router] Patched ${path.relative(projectRoot, filePath)}`);
}

// 1. Patch node_modules/expo-router/build/fork/useLinking.native.js
patchFile(path.join(projectRoot, 'node_modules/expo-router/build/fork/useLinking.native.js'), false);

// 2. Patch node_modules/expo-router/build/react-navigation/native/useLinking.native.js
patchFile(path.join(projectRoot, 'node_modules/expo-router/build/react-navigation/native/useLinking.native.js'), true);
