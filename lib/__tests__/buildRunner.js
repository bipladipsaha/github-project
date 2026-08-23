const fs = require('fs');
let route = fs.readFileSync('app/api/parse-resume/route.js', 'utf8');
route = route.replace(/import { NextResponse } from 'next\/server';/g, 'const NextResponse = {};');
route = route.replace(/export async function POST/g, 'async function POST');
route = route.replace(/export\s*\{[\s\S]*?\};/, '');

let test = fs.readFileSync('lib/__tests__/resumeParser.test.js', 'utf8');
test = test.replace(/const \{[^}]+\} = require\('[^']+'\);/, '');

fs.writeFileSync('lib/__tests__/runner.js', route + '\n' + test);
