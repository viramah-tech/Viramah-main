/*
 * Compare frontend runtime API calls with backend route definitions.
 * Usage: node scripts/verify_api_contract.js
 */

const fs = require('fs');
const path = require('path');

const WEBSITE_ROOT = path.resolve(__dirname, '..');
const BACKEND_ROOT = path.resolve(WEBSITE_ROOT, '..', 'viramah-backend');

const FRONTEND_SCAN_DIRS = [
  path.join(WEBSITE_ROOT, 'src', 'app', 'user-onboarding'),
  path.join(WEBSITE_ROOT, 'src', 'context'),
  path.join(WEBSITE_ROOT, 'src', 'hooks'),
  path.join(WEBSITE_ROOT, 'src', 'lib'),
];

const BACKEND_ROUTE_SOURCES = [
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'auth.js'), prefix: '/api/public/auth' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'onboarding.js'), prefix: '/api/public/onboarding' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'rooms.js'), prefix: '/api/public/rooms' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'deposits.js'), prefix: '/api/public/deposits' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'upload.js'), prefix: '/api/public/upload' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'payments.js'), prefix: '/api/public/payments' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'public', 'verification.js'), prefix: '/api/public/verification' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'v1', 'bookings.js'), prefix: '/api/v1/bookings' },
  { file: path.join(BACKEND_ROOT, 'src', 'routes', 'paymentV2.js'), prefix: '/api/payment' },
];

const REQUIRED_CRITICAL_ENDPOINTS = [
  { method: 'GET', path: '/api/public/auth/me' },
  { method: 'GET', path: '/api/public/onboarding/status' },
  { method: 'PATCH', path: '/api/public/onboarding/step-3' },
  { method: 'POST', path: '/api/public/onboarding/confirm' },
  { method: 'GET', path: '/api/public/rooms' },
  { method: 'GET', path: '/api/public/deposits/status' },
  { method: 'GET', path: '/api/v1/bookings/my-booking' },
  { method: 'POST', path: '/api/v1/bookings' },
  { method: 'GET', path: '/api/v1/bookings/:param' },
  { method: 'POST', path: '/api/v1/bookings/:param/pay' },
  { method: 'GET', path: '/api/payment/plan/me' },
  { method: 'POST', path: '/api/payment/submit' },
];

function walk(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, out);
      continue;
    }
    if (/\.(ts|tsx|js|jsx|mjs|cjs)$/.test(entry.name)) {
      out.push(full);
    }
  }
}

function toLine(source, index) {
  return source.slice(0, index).split('\n').length;
}

function normalizePath(rawPath) {
  let p = String(rawPath || '').trim();
  if (!p) return p;

  const apiIndex = p.indexOf('/api/');
  if (apiIndex >= 0) {
    p = p.slice(apiIndex);
  }

  p = p.split('?')[0];
  p = p.replace(/\$\{[^}]+\}/g, ':param');
  p = p.replace(/:[A-Za-z0-9_]+/g, ':param');
  p = p.replace(/\/+/g, '/');

  if (p.length > 1 && p.endsWith('/')) {
    p = p.slice(0, -1);
  }

  return p;
}

function parseMethodFromArgs(argsChunk) {
  const methodMatch = argsChunk.match(/method\s*:\s*['"]([A-Za-z]+)['"]/);
  return (methodMatch ? methodMatch[1] : 'GET').toUpperCase();
}

function extractCallsFromPattern(source, filePath, pattern) {
  const out = [];
  let match;
  while ((match = pattern.exec(source)) !== null) {
    const rawPath = match[2];
    const argsChunk = source.slice(match.index, match.index + 420);
    const method = parseMethodFromArgs(argsChunk);
    const pathNorm = normalizePath(rawPath);
    if (!pathNorm.startsWith('/api/')) continue;

    out.push({
      file: path.relative(WEBSITE_ROOT, filePath).replace(/\\/g, '/'),
      line: toLine(source, match.index),
      method,
      path: pathNorm,
    });
  }
  return out;
}

function extractFrontendCalls(filePath) {
  const source = fs.readFileSync(filePath, 'utf8');

  const apiFetchPattern = /apiFetch\s*\(\s*([`'"])([^`'"\n]*\/api\/[^`'"\n]*)\1/g;
  const fetchPattern = /fetch\s*\(\s*([`'"])([^`'"\n]*\/api\/[^`'"\n]*)\1/g;

  const calls = [
    ...extractCallsFromPattern(source, filePath, apiFetchPattern),
    ...extractCallsFromPattern(source, filePath, fetchPattern),
  ];

  return calls;
}

function extractBackendRoutes(filePath, prefix) {
  if (!fs.existsSync(filePath)) return [];

  const source = fs.readFileSync(filePath, 'utf8');
  const routes = [];
  const routePattern = /router\.(get|post|patch|put|delete)\s*\(\s*['"]([^'"]+)['"]/g;

  let match;
  while ((match = routePattern.exec(source)) !== null) {
    const method = match[1].toUpperCase();
    const routePath = match[2];
    const full = routePath === '/' ? prefix : `${prefix}${routePath}`;

    routes.push({
      method,
      path: normalizePath(full),
      source: path.relative(BACKEND_ROOT, filePath).replace(/\\/g, '/'),
      line: toLine(source, match.index),
    });
  }

  return routes;
}

function pathsMatch(lhs, rhs) {
  const left = lhs.split('/').filter(Boolean);
  const right = rhs.split('/').filter(Boolean);
  if (left.length !== right.length) return false;

  for (let i = 0; i < left.length; i += 1) {
    if (left[i] === ':param' || right[i] === ':param') continue;
    if (left[i] !== right[i]) return false;
  }

  return true;
}

function hasRoute(routes, method, targetPath) {
  return routes.some((route) => route.method === method && pathsMatch(route.path, targetPath));
}

function methodsForPath(routes, targetPath) {
  const methods = new Set();
  for (const route of routes) {
    if (pathsMatch(route.path, targetPath)) {
      methods.add(route.method);
    }
  }
  return [...methods.values()].sort();
}

const frontendFiles = [];
for (const dir of FRONTEND_SCAN_DIRS) walk(dir, frontendFiles);

const frontendCalls = frontendFiles.flatMap(extractFrontendCalls);
const backendRoutes = BACKEND_ROUTE_SOURCES.flatMap((source) =>
  extractBackendRoutes(source.file, source.prefix)
);

const missing = [];
const methodMismatch = [];
const matched = [];

for (const call of frontendCalls) {
  if (hasRoute(backendRoutes, call.method, call.path)) {
    matched.push(call);
    continue;
  }

  const pathMethods = methodsForPath(backendRoutes, call.path);
  if (!pathMethods.length) {
    missing.push(call);
    continue;
  }

  methodMismatch.push({
    ...call,
    backendMethods: pathMethods,
  });
}

const criticalFailures = [];
for (const endpoint of REQUIRED_CRITICAL_ENDPOINTS) {
  if (!hasRoute(backendRoutes, endpoint.method, endpoint.path)) {
    criticalFailures.push(endpoint);
  }
}

console.log('Frontend runtime API calls scanned:', frontendCalls.length);
console.log('Backend routes indexed:', backendRoutes.length);
console.log('Matched:', matched.length);
console.log('Method mismatches:', methodMismatch.length);
console.log('Missing routes:', missing.length);

if (methodMismatch.length) {
  console.log('\nMethod mismatches:');
  for (const issue of methodMismatch) {
    console.log(`- ${issue.method} ${issue.path} at ${issue.file}:${issue.line} (backend has ${issue.backendMethods.join(', ')})`);
  }
}

if (missing.length) {
  console.log('\nMissing routes in backend registry:');
  for (const issue of missing) {
    console.log(`- ${issue.method} ${issue.path} at ${issue.file}:${issue.line}`);
  }
}

if (criticalFailures.length) {
  console.log('\nCritical endpoint definitions missing in backend route files:');
  for (const endpoint of criticalFailures) {
    console.log(`- ${endpoint.method} ${endpoint.path}`);
  }
}

if (missing.length || methodMismatch.length || criticalFailures.length) {
  process.exit(1);
}

console.log('\nAPI contract check passed.');
