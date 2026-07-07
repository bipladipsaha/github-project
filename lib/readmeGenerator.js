/**
 * README Template Generator
 * 
 * Generates a personalized README.md that references the user's
 * SVG assets with dark/light mode support via <picture> tags.
 */

export function generateReadme(formData) {
  const {
    fullName = 'Your Name',
    githubUsername = 'username',
    portfolioUrl = '',
    linkedinUsername = '',
    email = '',
    twitterUsername = '',
    resumeUrl = '',
  } = formData;

  // Build badge links
  const badges = [];

  if (portfolioUrl) {
    badges.push(
      `<a href="${portfolioUrl}"><picture><source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/PORTFOLIO-FBBF24?style=flat-square&logoColor=000000"/><img src="https://img.shields.io/badge/PORTFOLIO-EAB308?style=flat-square&logoColor=ffffff" alt="Portfolio"/></picture></a>`
    );
  }

  if (resumeUrl) {
    badges.push(
      `<a href="${resumeUrl}"><picture><source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/RESUME-A78BFA?style=flat-square&logo=adobeacrobatreader&logoColor=000000"/><img src="https://img.shields.io/badge/RESUME-7C3AED?style=flat-square&logo=adobeacrobatreader&logoColor=ffffff" alt="Resume"/></picture></a>`
    );
  }

  if (linkedinUsername) {
    badges.push(
      `<a href="https://linkedin.com/in/${linkedinUsername}/"><picture><source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/LINKEDIN-60A5FA?style=flat-square&logo=linkedin&logoColor=000000"/><img src="https://img.shields.io/badge/LINKEDIN-0A66C2?style=flat-square&logo=linkedin&logoColor=ffffff" alt="LinkedIn"/></picture></a>`
    );
  }

  if (twitterUsername) {
    badges.push(
      `<a href="https://x.com/${twitterUsername}"><picture><source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/X-94A3B8?style=flat-square&logoColor=000000"/><img src="https://img.shields.io/badge/X-334155?style=flat-square&logoColor=ffffff" alt="X"/></picture></a>`
    );
  }

  if (email) {
    badges.push(
      `<a href="mailto:${email}"><picture><source media="(prefers-color-scheme: dark)" srcset="https://img.shields.io/badge/EMAIL-F87171?style=flat-square&logoColor=000000"/><img src="https://img.shields.io/badge/EMAIL-EA4335?style=flat-square&logoColor=ffffff" alt="Email"/></picture></a>`
    );
  }

  const badgesBlock = badges.length > 0 ? '\n' + badges.join('\n') + '\n' : '';

  return `<div align="center">

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/header-v1.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/header-v1.svg" alt="${fullName}"/></picture>
${badgesBlock}
</div>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/s01.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/s01.svg" alt="01 — whoami"/></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/whoami.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/whoami.svg" alt="About ${fullName}"/></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/s03.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/s03.svg" alt="02 — projects"/></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/projects.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/projects.svg" alt="Projects"/></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/s06.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/s06.svg" alt="03 — stack"/></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/stack.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/stack.svg" alt="Technical stack"/></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/s04.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/s04.svg" alt="04 — telemetry"/></picture>
<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/telemetry.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/telemetry.svg" alt="Animated development telemetry"/></picture>

<div align="center">

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/github-stats.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/github-stats.svg" width="97%" alt="GitHub statistics and repository languages"/></picture>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&bg_color=00000000&color=ffffff&line=ffffff&point=ffffff&area_color=ffffff&area=true&hide_border=true&radius=0&custom_title=CONTRIBUTION%20TELEMETRY"/><img src="https://github-readme-activity-graph.vercel.app/graph?username=${githubUsername}&bg_color=00000000&color=000000&line=000000&point=000000&area_color=000000&area=true&hide_border=true&radius=0&custom_title=CONTRIBUTION%20TELEMETRY" width="97%" alt="GitHub contribution activity"/></picture>

</div>

<picture><source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/dark/footer.svg"/><img src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/main/assets/footer.svg" alt="Current status"/></picture>

<div align="center">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/output/github-snake-dark.svg">
  <source media="(prefers-color-scheme: light)" srcset="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/output/github-snake.svg">
  <img alt="github contribution grid snake animation" src="https://raw.githubusercontent.com/${githubUsername}/${githubUsername}/output/github-snake.svg">
</picture>
</div>
`;
}
