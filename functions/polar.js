// functions/admin.js - FIXED VERSION

export async function onRequest(context) {
  const { request, env } = context

  try {
    console.log('🔍 Admin function called')
    console.log('📍 Request URL:', request.url)
    console.log('🔑 ADMIN_PASSWORD env:', env.ADMIN_PASSWORD)
    console.log('🔑 SUPABASE_URL env:', env.SUPABASE_URL)
    console.log('🔑 SUPABASE_SECRET_KEY env:', env.SUPABASE_SECRET_KEY ? 'SET' : 'NOT SET')

    // Fetch polar.html from root
    const adminUrl = new URL('/polar.html', request.url).toString()
    console.log('📄 Fetching from:', adminUrl)
    
    const response = await fetch(adminUrl)
    
    if (!response.ok) {
      console.error('❌ Failed to fetch polar.html:', response.status)
      return new Response('Could not load polar.html', { status: 500 })
    }

    let html = await response.text()
    console.log('✅ polar.html loaded, length:', html.length)

    // Create the injection script
    const injectedScript = `
    <script>
      console.log('💉 Injecting environment variables...')
      globalThis.ADMIN_PASSWORD = '${env.ADMIN_PASSWORD || 'UNDEFINED'}'
      globalThis.SUPABASE_URL = '${env.SUPABASE_URL || 'UNDEFINED'}'
      globalThis.SUPABASE_SECRET_KEY = '${env.SUPABASE_SECRET_KEY || 'UNDEFINED'}'
      console.log('✅ ADMIN_PASSWORD:', globalThis.ADMIN_PASSWORD)
      console.log('✅ SUPABASE_URL:', globalThis.SUPABASE_URL)
      console.log('✅ SUPABASE_SECRET_KEY:', globalThis.SUPABASE_SECRET_KEY ? 'SET' : 'NOT SET')
    </script>
    `

    // Replace </head> with script + </head>
    if (html.includes('</head>')) {
      html = html.replace('</head>', injectedScript + '</head>')
      console.log('✅ Script injected')
    } else {
      console.warn('⚠️ No </head> found, adding to top of body')
      html = html.replace('<body>', '<body>' + injectedScript)
    }

    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
  } catch (error) {
    console.error('❌ Error in admin function:', error)
    return new Response('Error: ' + error.message, { status: 500 })
  }
}