export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      });
    }

    const GITHUB_TOKEN = env.GITHUB_TOKEN;
    const GITHUB_REPO = 'nicolasitd/altavia-dashboard';
    const GITHUB_FILE = 'historial/estado.json';
    const apiUrl = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/' + GITHUB_FILE;

    if (request.method === 'GET') {
      const resp = await fetch(apiUrl, {
        headers: {
          'Authorization': 'token ' + GITHUB_TOKEN,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'altavia-worker'
        }
      });
      const data = await resp.json();
      const content = atob(data.content.replace(/\n/g, ''));
      return new Response(JSON.stringify({ content, sha: data.sha }), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (request.method === 'PUT') {
      const body = await request.json();
      const encoded = btoa(unescape(encodeURIComponent(body.content)));
      const resp = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Authorization': 'token ' + GITHUB_TOKEN,
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'altavia-worker',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: body.message || 'Update historial',
          content: encoded,
          sha: body.sha
        })
      });
      const data = await resp.json();
      return new Response(JSON.stringify(data), {
        status: resp.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    return new Response('Method not allowed', { status: 405, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
};
