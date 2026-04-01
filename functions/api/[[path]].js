export async function onRequest(context) {
  const { request, params } = context;
  const url = new URL(request.url);
  
  // params.path is an array of the path segments matched by [[path]]
  const apiSegments = params.path || [];
  const apiPath = apiSegments.join('/');
  
  // Construct the target URL by appending the captured path to the external API
  const targetUrl = new URL(`https://bwgapi.balboawater.com/${apiPath}${url.search}`);

  // Create a new request based on the original one
  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers: new Headers(request.headers),
    body: request.body,
    redirect: 'follow'
  });

  // Remove Host header to avoid mismatch with the target endpoint
  proxyRequest.headers.delete('Host');

  try {
    const response = await fetch(proxyRequest);
    
    // Create a new response object to ensure flexibility in modifying headers
    const newResponse = new Response(response.body, response);
    
    // Set CORS headers for frontend access
    newResponse.headers.set('Access-Control-Allow-Origin', '*');
    newResponse.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    newResponse.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    return newResponse;
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Proxy error', details: err.message }), {
      status: 502,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
