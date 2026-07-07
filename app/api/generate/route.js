import { NextResponse } from 'next/server';
import JSZip from 'jszip';
import { generateSVGs } from '@/lib/svgGenerator';
import { generateReadme } from '@/lib/readmeGenerator';
import {
  generateUpdateStatsScript,
  generateUpdateStatsWorkflow,
  generateSnakeWorkflow,
} from '@/lib/actionsGenerator';

export async function POST(request) {
  try {
    const formData = await request.json();

    // Validate required fields
    if (!formData.fullName || !formData.githubUsername) {
      return NextResponse.json(
        { error: 'Full name and GitHub username are required.' },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const format = url.searchParams.get('format');

    const zip = new JSZip();
    const username = formData.githubUsername;

    // 1. Generate all SVG files
    const { results: svgFiles, errors } = await generateSVGs(formData);

    // 2. Generate README.md
    const readme = generateReadme(formData);

    // 3. Generate GitHub Actions
    const statsScript = generateUpdateStatsScript(username);
    const statsWorkflow = generateUpdateStatsWorkflow();
    const snakeWorkflow = generateSnakeWorkflow();

    if (format === 'json') {
      const assets = [];
      for (const [filename, content] of svgFiles) {
        assets.push({ filename, content });
      }
      // Notice path for github actions since deploy route adds 'assets/' prefix.
      // Actually, wait, deploy route adds 'assets/' prefix to all assets. Let's fix deploy route to just use asset.path.
      // But for now we can just return what we need.
      return NextResponse.json({
        readmeContent: readme,
        assets: assets
      });
    }

    for (const [filename, content] of svgFiles) {
      zip.file(`assets/${filename}`, content);
    }
    zip.file('README.md', readme);
    zip.file('.github/scripts/update_stats.js', statsScript);
    zip.file('.github/workflows/update-stats.yml', statsWorkflow);
    zip.file('.github/workflows/snake.yml', snakeWorkflow);

    // 4. Generate a setup guide
    const setupGuide = generateSetupGuide(username);
    zip.file('SETUP.md', setupGuide);

    // 5. Create the ZIP
    const zipBuffer = await zip.generateAsync({
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: { level: 9 },
    });

    // Return the ZIP file
    return new NextResponse(zipBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${username}-github-profile.zip"`,
        'Content-Length': zipBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate profile. Please try again.' },
      { status: 500 }
    );
  }
}

function generateSetupGuide(username) {
  return `# 🚀 Setup Guide for Your GitHub Profile

## Quick Start

1. **Create your profile repository** (if you don't have one already):
   - Go to https://github.com/new
   - Name it exactly: \`${username}\`
   - Make it **public**
   - Initialize with a README (you'll replace it)

2. **Upload these files**:
   - Extract this ZIP
   - Replace ALL contents of your \`${username}\` repository with these files
   - Push to main branch

3. **Enable GitHub Actions**:
   - Go to your repo → Settings → Actions → General
   - Select "Allow all actions and reusable workflows"
   - The \`update-stats.yml\` workflow will auto-update your stats daily
   - The \`snake.yml\` workflow will generate the contribution snake animation

## File Structure

\`\`\`
${username}/
├── README.md                           # Your styled profile
├── assets/
│   ├── header-v1.svg                   # Header with your name
│   ├── s01.svg                         # Section divider: whoami
│   ├── whoami.svg                      # About you section
│   ├── s03.svg                         # Section divider: projects
│   ├── projects.svg                    # Featured projects
│   ├── s04.svg                         # Section divider: telemetry
│   ├── telemetry.svg                   # Animated stats
│   ├── github-stats.svg               # GitHub stats card
│   ├── s06.svg                         # Section divider: stack
│   ├── stack.svg                       # Tech stack
│   ├── footer.svg                      # Footer
│   └── dark/                           # Dark mode variants
│       └── (same files as above)
├── .github/
│   ├── scripts/
│   │   └── update_stats.js             # Auto-update script
│   └── workflows/
│       ├── update-stats.yml            # Daily stats update
│       └── snake.yml                   # Snake animation
└── SETUP.md                            # This file
\`\`\`

## Troubleshooting

- **Snake animation not showing?** Wait for the first workflow run, or manually trigger it from Actions tab.
- **Stats not updating?** Check that GITHUB_TOKEN has read permissions in your repo settings.
- **Dark mode not working?** GitHub automatically switches based on user's system theme.

---

Generated with ❤️ by ProfileForge
`;
}
