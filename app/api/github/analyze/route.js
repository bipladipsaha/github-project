import { getToken } from "next-auth/jwt";
import { Octokit } from "@octokit/rest";
import { NextResponse } from "next/server";

export async function GET(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  
  if (!token || !token.accessToken || !token.username) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const octokit = new Octokit({ auth: token.accessToken });
  const username = token.username;

  try {
    const { data } = await octokit.rest.repos.getContent({
      owner: username,
      repo: username,
      path: "README.md",
    });

    if (data.type === 'file' && data.content) {
      const content = Buffer.from(data.content, 'base64').toString('utf-8');
      
      // Detect common widgets
      const widgets = [];
      if (content.match(/visitor-badge|komarev\.com/i)) widgets.push({ id: 'visitor', name: 'Visitor Counter', snippet: 'visitor-badge' });
      if (content.match(/github-readme-stats|github-readme-streak/i)) widgets.push({ id: 'stats', name: 'GitHub Stats', snippet: 'github-readme-stats' });
      if (content.match(/spotify/i)) widgets.push({ id: 'spotify', name: 'Spotify Widget', snippet: 'spotify' });
      if (content.match(/wakatime/i)) widgets.push({ id: 'wakatime', name: 'WakaTime', snippet: 'wakatime' });
      if (content.match(/snake\.svg|snk/i)) widgets.push({ id: 'snake', name: 'Snake Animation', snippet: 'snake.svg' });

      return NextResponse.json({
        exists: true,
        content,
        sha: data.sha,
        widgets
      });
    }
    
    return NextResponse.json({ exists: false, content: null, widgets: [] });
  } catch (error) {
    if (error.status === 404) {
      return NextResponse.json({ exists: false, content: null, widgets: [] });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
