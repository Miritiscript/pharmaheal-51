
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  try {
    // Get the URL to proxy from the request
    const { url } = await req.json();
    
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: "Missing or invalid URL parameter" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log(`Proxying asset from: ${url}`);
    
    // Fetch the remote resource
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status} ${response.statusText}`);
    }
    
    // Read the response as an array buffer to handle any content type
    const data = await response.arrayBuffer();
    
    // Get the content type from the response
    const contentType = response.headers.get("Content-Type") || "application/octet-stream";
    
    console.log(`Successfully proxied asset with content type: ${contentType}`);
    
    // Return the proxied response with the correct content type
    return new Response(data, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400"
      }
    });
  } catch (error) {
    console.error("Error in asset-proxy function:", error);
    
    return new Response(JSON.stringify({
      error: error.message || "Unknown error occurred",
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
