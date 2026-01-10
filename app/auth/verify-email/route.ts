import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  
  // Supabase automatically verifies the email when the user clicks the link
  // This route is just the redirect destination after verification
  // Redirect back to signup page so the dialog can detect verification
  return NextResponse.redirect(new URL('/signup?verified=true', requestUrl.origin))
}
