import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

// Define secret patterns for detection
const secretPatterns = [
  /apikey\s*[:=]\s*[a-z0-9]{32,}/i, // API Keys
  /password\s*[:=]\s*.+/i,          // Passwords
  /secret\s*[:=]\s*.+/i,            // Secrets
  /aws_access_key_id\s*[:=]\s*\w+/i, // AWS Access Keys
  /private_key\s*[:=]\s*-{5}BEGIN.*?-{5}/i, // Private Keys
];

const GITHUB_API_BASE_URL = 'https://api.github.com/repos';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 


export async function POST(req: NextRequest, res: NextResponse) {
    
  if (req.method !== 'POST') {
    return NextResponse.json(
        {message: "Method not allowed"},
        {status: 405}
    )
  }

  const requestBody = await req.json();
  const { repoUrl } = requestBody;

  try {
    const [, owner, repo] = repoUrl.match(/github\.com\/([^/]+)\/([^/]+)/);

    const response = await axios.get(`${GITHUB_API_BASE_URL}/${owner}/${repo}/contents`, {
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
      },
    });

    const files = response.data;
    const alerts: string[] = [];

    for (const file of files) {
      if (file.type === 'file') {
        const fileContentResponse = await axios.get(file.download_url);
        const fileContent = fileContentResponse.data;

        secretPatterns.forEach((pattern) => {
          if (pattern.test(fileContent)) {
            alerts.push(`Potential secret found in ${file.path}`);
          }
        });
      }
    }

    return NextResponse.json(
        {message: alerts.length ? alerts : ['No secrets found!'] },
        {status: 200}
    )   

  } catch (error) {
    console.error(error);
    return NextResponse.json(
        {message: "Failed to scan repository" },
        {status: 200}
    )

  }
}
