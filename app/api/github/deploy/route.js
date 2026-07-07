import { getToken } from "next-auth/jwt";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.accessToken || !token.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { readmeContent, assets, currentSha } = await req.json();

  if (!readmeContent) {
    return NextResponse.json({ error: "No README content provided." }, { status: 400 });
  }

  const octokit = new Octokit({ auth: token.accessToken });
  const username = token.username;
  const repoName = username; // User's special profile repo

  try {
    // 1. Check if repo exists, if not create it.
    let repoExists = true;
    try {
      await octokit.rest.repos.get({ owner: username, repo: repoName });
    } catch (e) {
      if (e.status === 404) {
        repoExists = false;
      } else {
        throw e;
      }
    }

    if (!repoExists) {
      // Auto-create profile repository
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: "My GitHub Profile",
        homepage: "",
        private: false,
        has_issues: false,
        has_projects: false,
        has_wiki: false,
      });
      
      // Wait a moment for github to initialize it before committing
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // 2. Upload Assets to `assets/` directory
    if (assets && Array.isArray(assets)) {
      for (const asset of assets) {
        let sha;
        try {
          const { data } = await octokit.rest.repos.getContent({
            owner: username,
            repo: repoName,
            path: `assets/${asset.filename}`,
          });
          sha = data.sha;
        } catch (e) {
          // File doesn't exist, which is fine
        }

        await octokit.rest.repos.createOrUpdateFileContents({
          owner: username,
          repo: repoName,
          path: `assets/${asset.filename}`,
          message: `Add/update asset: ${asset.filename}`,
          content: Buffer.from(asset.content).toString('base64'),
          sha: sha, // needed if updating
        });
      }
    }

    // 3. Optional: Backup current README.md
    if (currentSha) {
      try {
        const { data: currentContent } = await octokit.rest.repos.getContent({
          owner: username,
          repo: repoName,
          path: "README.md",
        });

        if (currentContent.type === 'file') {
           let backupSha;
           try {
              const { data: backupData } = await octokit.rest.repos.getContent({
                owner: username,
                repo: repoName,
                path: "README.backup.md",
              });
              backupSha = backupData.sha;
           } catch(e) {}
           
           await octokit.rest.repos.createOrUpdateFileContents({
              owner: username,
              repo: repoName,
              path: "README.backup.md",
              message: "Backup previous README.md",
              content: currentContent.content,
              sha: backupSha
           });
        }
      } catch (e) {
        // Ignore backup failure if it doesn't exist
      }
    }

    // 4. Create or Update README.md
    const { data: finalData } = await octokit.rest.repos.createOrUpdateFileContents({
      owner: username,
      repo: repoName,
      path: "README.md",
      message: "Update GitHub Profile via Generator",
      content: Buffer.from(readmeContent).toString('base64'),
      sha: currentSha, // Must provide sha if updating
    });

    return NextResponse.json({ 
      success: true, 
      commitUrl: finalData.commit.html_url,
      profileUrl: `https://github.com/${username}`
    });

  } catch (error) {
    console.error("Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
