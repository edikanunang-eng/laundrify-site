

export async function onRequest(context) {
  const { request, env } = context

  try {
    
    const htmlResponse = await fetch(new URL('../polar.html', request.url))
    let html = await htmlResponse.text()

    const injectedScript = `
      <script>
        globalThis.ADMIN_PASSWORD = '${env.ADMIN_PASSWORD}'
        globalThis.SUPABASE_URL = '${env.SUPABASE_URL}'
        globalThis.SUPABASE_SECRET_KEY = '${env.SUPABASE_SECRET_KEY}'
      </script>
    `

    
    html = html.replace('</head>', injectedScript + '</head>')

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })
  } catch (error) {
    console.error('Error in admin function:', error)
    return new Response('Error loading admin panel', { status: 500 })
  }
}