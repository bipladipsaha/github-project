import { getToken } from "next-auth/jwt";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function POST(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.accessToken || !token.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { readmeContent, assets, workflows, currentSha } = await req.json();

  if (!readmeContent) {
    return NextResponse.json({ error: "No README content provided." }, { status: 400 });
  }

  const octokit = new Octokit({ auth: token.accessToken });
  const username = token.username;
  const repoName = username;

  try {
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
      await octokit.rest.repos.createForAuthenticatedUser({
        name: repoName,
        description: "My GitHub Profile",
        homepage: "",
        private: false,
        has_issues: false,
        has_projects: false,
        has_wiki: false,
        auto_init: true,
      });
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Get the latest commit SHA of the default branch
    const { data: repoData } = await octokit.rest.repos.get({ owner: username, repo: repoName });
    const defaultBranch = repoData.default_branch;
    
    const { data: refData } = await octokit.rest.git.getRef({
      owner: username,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
    });
    const latestCommitSha = refData.object.sha;

    // Get the base tree
    const { data: commitData } = await octokit.rest.git.getCommit({
      owner: username,
      repo: repoName,
      commit_sha: latestCommitSha,
    });
    const baseTreeSha = commitData.tree.sha;

    // Create blobs for all assets and build the new tree array
    const tree = [];
    
    if (assets && Array.isArray(assets)) {
      for (const asset of assets) {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner: username,
          repo: repoName,
          content: Buffer.from(asset.content).toString('base64'),
          encoding: 'base64',
        });
        tree.push({
          path: `assets/${asset.filename}`,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        });
      }
    }

    if (workflows && Array.isArray(workflows)) {
      for (const wf of workflows) {
        const { data: blobData } = await octokit.rest.git.createBlob({
          owner: username,
          repo: repoName,
          content: Buffer.from(wf.content).toString('base64'),
          encoding: 'base64',
        });
        tree.push({
          path: wf.path,
          mode: '100644',
          type: 'blob',
          sha: blobData.sha,
        });
      }
    }

    // Handle README.backup.md and README.md
    if (currentSha) {
      try {
        const { data: currentContent } = await octokit.rest.repos.getContent({
          owner: username,
          repo: repoName,
          path: "README.md",
        });
        if (currentContent.type === 'file') {
          const { data: backupBlob } = await octokit.rest.git.createBlob({
            owner: username,
            repo: repoName,
            content: currentContent.content,
            encoding: 'base64',
          });
          tree.push({
            path: "README.backup.md",
            mode: '100644',
            type: 'blob',
            sha: backupBlob.sha,
          });
        }
      } catch (e) {}
    }

    const { data: readmeBlob } = await octokit.rest.git.createBlob({
      owner: username,
      repo: repoName,
      content: Buffer.from(readmeContent).toString('base64'),
      encoding: 'base64',
    });
    
    tree.push({
      path: "README.md",
      mode: '100644',
      type: 'blob',
      sha: readmeBlob.sha,
    });

    // Create the new tree
    const { data: newTree } = await octokit.rest.git.createTree({
      owner: username,
      repo: repoName,
      base_tree: baseTreeSha,
      tree,
    });

    // Create the new commit
    const { data: newCommit } = await octokit.rest.git.createCommit({
      owner: username,
      repo: repoName,
      message: "Update GitHub Profile via Generator",
      tree: newTree.sha,
      parents: [latestCommitSha],
    });

    // Update the reference
    await octokit.rest.git.updateRef({
      owner: username,
      repo: repoName,
      ref: `heads/${defaultBranch}`,
      sha: newCommit.sha,
    });

    return NextResponse.json({ 
      success: true, 
      commitUrl: newCommit.html_url,
      profileUrl: `https://github.com/${username}`
    });

  } catch (error) {
    console.error("Deploy Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
