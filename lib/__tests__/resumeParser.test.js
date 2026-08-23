const { 
  segmentSections, 
  extractStructured, 
  validateAndNormalize, 
  mapToFormSchema 
} = require('../../app/api/parse-resume/route');

// Helper to run the full pipeline
function parseTest(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const sections = segmentSections(lines);
  const structured = extractStructured(sections, text);
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

  console.log('Running Resume Parser Tests...\n');

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

  // Test 3: GitHub username
  const t3 = parseTest(`
Bipladip Saha
https://github.com/bipladipsaha
  `);
  assertEqual('Test 3: Extract GitHub Username', t3.githubUsername, 'bipladipsaha');

  // Test 4: University extraction under education
  const t4 = parseTest(`
Bipladip Saha

EDUCATION
Bachelor of Technology (B.Tech)
Institute of Engineering and Management, Kolkata
2024 - 2028
  `);
  assertEqual('Test 4: Extract University', t4.university, 'Institute of Engineering and Management, Kolkata');

  // Test 5: Missing location
  const t5 = parseTest(`
Bipladip Saha
bipladip555@gmail.com
  `);
  assertEqual('Test 5: No guessed location', t5.location, undefined);

  // Test 6: Experience orgs not in university
  const t6 = parseTest(`
Bipladip Saha

EXPERIENCE
IDeCLAB, UNIVERSITY OF ENGINEERING AND MANAGEMENT
- Built some cool things
  `);
  assertEqual('Test 6: Experience org not in university', t6.university, undefined);

  // User Resume Integration Test
  const t7 = parseTest(`
BIPLADIP SAHA
bipladip555@gmail.com https://www.linkedin.com/in/bipladip-saha/ https://github.com/bipladipsaha KOLKATA,WEST BENGAL
https://portfolio-three-iota-27.vercel.app/

SUMMARY
Enthusiastic B.Tech CSE (AI & ML) student with strong foundational knowledge...

EXPERIENCE
Title
IDECLAB, UNIVERSITY OF ENGINEERING AND MANAGEMENT
2025- 2026
An open innovation and research-oriented lab focused on fostering...
•Developed a structured inventory management application...

EDUCATION
BachelorofTechnology (B.Tech) in Computer Science & Enineeri ng (AI )
Institute of Engineering and Management, Kolkata
2024 - 2028
CGPA (Till 3rd semester): 8.8/ 10.0

PROJECTS
IoT-BasedMonitoring / Alert System
Tech Stack: ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase
•Developed a real-time IoT system for live location tracking and motion detection.
  `);

  assertEqual('Test 7: Full Name', t7.fullName, 'BIPLADIP SAHA');
  assertEqual('Test 7: GitHub Username', t7.githubUsername, 'bipladipsaha');
  assertEqual('Test 7: Location', t7.location, 'KOLKATA,WEST BENGAL');
  assertEqual('Test 7: University', t7.university, 'Institute of Engineering and Management, Kolkata');
  assertEqual('Test 7: Tech Stack in Project', t7.projects[0].techStack, 'ESP32, GPS NEO-6M, Accelerometer, GSM Module, Firebase');


  console.log(`\nTests Completed: ${passed} passed, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

runTests();
