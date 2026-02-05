// Test script to verify Edge Functions are working
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://127.0.0.1:54321',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlzcyI6Imh0dHA6Ly8xMjcuMC4wLjE6NTQzMjEvYXV0aC92MSIsImlhdCI6MTc3MDExNTU2NiwiZXhwIjo0OTIzNzE1NTY2fQ.FGDVEE0aGrTHmcwVWdElKS6Fi8J4RH6T22BLg9rEPz0' // Replace with actual key
);

async function testFunction() {
  try {
    const { data, error } = await supabase.functions.invoke('compare-jd', {
      body: {
        resumeText: `
SENIOR FRONTEND ENGINEER
John Doe | john@example.com

SKILLS
- JavaScript (ES6+), TypeScript, React, Redux
- HTML5, CSS3, Tailwind CSS, SCSS
- Testing: Jest, React Testing Library, Cypress
- Build Tools: Webpack, Vite
- Version Control: Git, GitHub

EXPERIENCE : 6 years
Frontend Developer | Tech Solutions Inc.
2020 - Present
- Developed scalable web applications using React and TypeScript.
- Implemented responsive designs using Tailwind CSS causing 20% increase in mobile engagement.
- Optimized application performance, reducing load times by 40%.
- integrated RESTful APIs and managed state with Redux Toolkit.
`,
        jobDescription: `
JOB TITLE: Senior React Developer

We are looking for a Senior React Developer to join our team.

REQUIREMENTS:
- 3+ years of experience with React and TypeScript.
- Strong understanding of modern JavaScript (ES6+).
- Experience with state management (Redux, Context API).
- Proficiency in CSS frameworks like Tailwind CSS.
- Familiarity with testing frameworks (Jest, Cypress).
- Experience with build tools like Vite is a plus.

EXPERIENCE REQUIRED:
- 3+ years

RESPONSIBILITIES:
- Build high-quality, reusable components.
- Collaborate with designers to implement responsive UIs.
- Optimize frontend performance.
`
      }
    });

    if (error) {
      console.error('Function error:', error);
    } else {
      console.log('Function response:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Network error:', err);
  }
}

testFunction();
