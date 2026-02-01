import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight requests
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Request received");
        const authHeader = req.headers.get('Authorization');
        console.log("Auth Header present:", !!authHeader);

        if (!authHeader) {
            throw new Error('Missing Authorization header');
        }

        const { email, password, name, role } = await req.json()
        console.log("Payload:", { email, name, role });

        if (!email || !password || !name) {
            return new Response(
                JSON.stringify({ error: 'Email, password and name are required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Create the user in Auth
        console.log("Creating user in Auth...");
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: { name: name }
        })

        if (createError) {
            console.error("Auth Create Error:", createError);
            throw createError
        }

        if (!userData.user) throw new Error('User creation failed')

        // 2. Insert into profiles table
        console.log("Upserting profile...");
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userData.user.id,
                name: name,
                role: role || 'seller',
                created_at: new Date().toISOString()
            })

        if (profileError) {
            console.error("Profile Error:", profileError);
            return new Response(
                JSON.stringify({ error: 'User created but profile failed: ' + profileError.message }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
            )
        }

        return new Response(
            JSON.stringify({ message: 'User created successfully', user: userData.user }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )

    } catch (error) {
        console.error("Global Catch:", error);
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 } // Returning 400 to distinguish from Gateway 401
        )
    }
})
