export default {
  async fetch(request, env) {
    // Original static file fetch karo Pages se
    const response = await env.ASSETS.fetch(request);
    
    // Sirf HTML pages process karo (images/CSS/JS skip)
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) return response;
    
    let html = await response.text();
    
    // header.html aur footer.html parallel fetch karo
    const origin = new URL(request.url).origin;
    const [headerHTML, footerHTML] = await Promise.all([
      env.ASSETS.fetch(new Request(`${origin}/header.html`)).then(r => r.text()),
      env.ASSETS.fetch(new Request(`${origin}/footer.html`)).then(r => r.text())
    ]);
    
    // Placeholders ko replace karo
    html = html
      .replace('<div id="header-placeholder"></div>', headerHTML)
      .replace('<div id="footer-placeholder"></div>', footerHTML);
    
    return new Response(html, {
      status: response.status,
      headers: response.headers
    });
  }
};
