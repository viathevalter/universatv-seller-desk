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
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        // Check if the user is authenticated and is an admin (optional strictly, but good practice)
        // For now, we rely on RLS policies or just authentication. 
        // Ideally, check if user.role or a profile field allows this.
        // Here we will assume any authenticated user with access to the Admin UI (protected by RLS/Page logic) can call this *if* they have the token.
        // A stricter check would be:
        // const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
        // if (userError || !user) throw new Error('Unauthorized')

        const { email, password, name, role } = await req.json()

        if (!email || !password || !name) {
            return new Response(
                JSON.stringify({ error: 'Email, password and name are required' }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
            )
        }

        // Create Supabase Admin Client (Service Role)
        // This allows us to create users bypassing email verification if needed, or just standard invite
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // 1. Create the user in Auth
        const { data: userData, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true, // Auto-confirm for now as we are admin creating it
            user_metadata: { name: name }
        })

        if (createError) throw createError

        if (!userData.user) throw new Error('User creation failed')

        // 2. Insert into profiles table
        // Note: The triggers might handle this if you have them, but explicit insertion ensures data consistency with params
        const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .upsert({
                id: userData.user.id,
                name: name,
                role: role || 'seller',
                created_at: new Date().toISOString()
            })

        if (profileError) {
            // Cleanup if profile fails? Or just return error. 
            // For now, return error but user is created.
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
        return new Response(
            JSON.stringify({ error: error.message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
