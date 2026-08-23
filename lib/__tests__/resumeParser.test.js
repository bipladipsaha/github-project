const { 
  extractStructured, 
  validateAndNormalize, 
  mapToFormSchema 
} = require('../../app/api/parse-resume/route');
const fs = require('fs');
const path = require('path');

function parseTest(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const structured = extractStructured(lines, text);
  const validated = validateAndNormalize(structured);
  return mapToFormSchema(validated);
}

function runTests() {
  let passed = 0;
  let failed = 0;

  function assertEqual(testName, actual, expected) {
    if (actual === expected || (Array.isArray(actual) && Array.isArray(expected) && JSON.stringify(actual) === JSON.stringify(expected))) {
      console.log(`✅ ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
      console.error(`   Expected:`, expected);
      console.error(`   Actual:  `, actual);
      failed++;
    }
  }

  function assertMatch(testName, actual, regex) {
    if (actual && regex.test(actual)) {
      console.log(`✅ ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
      console.error(`   Expected to match:`, regex);
      console.error(`   Actual:  `, actual);
      failed++;
    }
  }
  
  function assertNotMatch(testName, actual, regex) {
    if (!actual || !regex.test(actual)) {
      console.log(`✅ ${testName}`);
      passed++;
    } else {
      console.error(`❌ ${testName}`);
      console.error(`   Expected NOT to match:`, regex);
      console.error(`   Actual:  `, actual);
      failed++;
    }
  }

  console.log('Running Resume Parser Tests (Semantic Anchors)...\n');

  // Test 1: Location extraction
  const t1 = parseTest(`
Bipladip Saha
KOLKATA, WEST BENGAL
bipladip555@gmail.com
  `);
  assertEqual('Test 1: Extract simple location', t1.location, 'KOLKATA, WEST BENGAL');

  // Test 2: Tech stack in projects doesn't bleed into location
  const t2 = parseTest(`
Bipladip Saha
bipladip555@gmail.com

PROJECTS
IoT-Based Monitoring
Tech Stack: ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase
- Did some stuff
  `);
  assertEqual('Test 2: Projects tech stack not in location', t2.location, undefined);
  assertEqual('Test 2: Projects extracted correctly', t2.projects && t2.projects.length > 0 ? t2.projects[0].techStack : undefined, 'ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase');

  // Test 3: University extraction under education
  const t4 = parseTest(`
Bipladip Saha

EDUCATION
Bachelor of Technology (B.Tech)
Institute of Engineering and Management, Kolkata
2024 - 2028
  `);
  assertEqual('Test 3: Extract University', t4.university, 'Institute of Engineering and Management, Kolkata');

  // Test 4: Real PDF Scrambled Text (the actual bug)
  const t7 = parseTest(`
Tech Stack: ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase
IoT-BasedMonitoring / Alert System
BIPLADIP SAHA
bipladip555@gmail.com
Recognized as the 2nd Runner-Up for developing an innovative and
https://www.linkedin.com/in/bipladip-saha/
•Developed a real-time IoT system
KOLKATA,WEST BENGAL
Tech Stack: Raspberry Pi, Python, OpenCV
•Developed a real-time word-based
Enthusiastic B.Tech CSE (AI & ML) student with strong foundational knowledge in software development.
PROJECTS
SUMMARY
EDUCATION
EXPERIENCE
KEY ACHIEVEMENTS
Sign Language to Voice Converter
Smart Inventory Management System
BachelorofTechnology (B.Tech) in Computer Science & Enineeri ng (AI )
Institute of Engineering and Management, Kolkata
Secured 2ndRunner-Upposition at DoubleSlash
IDECLAB, UNIVERSITY OF ENGINEERING AND MANAGEMENT
2024 - 2028 
2025- 2026 
https://github.com/bipladipsaha
  `);

  assertEqual('Test 4 (Real Scramble): Full Name', t7.fullName, 'BIPLADIP SAHA');
  assertEqual('Test 4 (Real Scramble): GitHub Username', t7.githubUsername, 'bipladipsaha');
  assertEqual('Test 4 (Real Scramble): Tagline', t7.tagline, 'B.Tech CSE (AI & ML) student');
  assertEqual('Test 4 (Real Scramble): Location', t7.location, 'KOLKATA,WEST BENGAL');
  assertMatch('Test 4 (Real Scramble): University', t7.university, /Institute of Engineering and Management/i);
  assertNotMatch('Test 4 (Real Scramble): University Not IDeCLAB', t7.university, /IDeCLAB/i);
  assertEqual('Test 4 (Real Scramble): Club Team', t7.clubTeam, undefined);
  
  if (t7.projects && t7.projects.length > 0) {
    assertMatch('Test 4 (Real Scramble): Project TechStack', t7.projects[0].techStack, /Accelerometer/i);
  } else {
    console.error('❌ Test 4: No projects found');
    failed++;
  }

  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
