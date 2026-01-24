const { createClient } = require('@supabase/supabase-js')
const dotenv = require('dotenv')
const path = require('path')

// Load env explicitly
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function run() {
    console.log("--- DEBUG START ---")
    console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        console.error("FATAL: SUPABASE_SERVICE_ROLE_KEY is missing in .env.local")
        return
    }

    const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    console.log("Fetching profiles via Service Role...")
    const { data, error } = await supabase
        .from('profiles')
        .select('*')

    if (error) {
        console.error("DB ERROR:", error)
    } else {
        console.log("DB SUCCESS. Profiles found:", data.length)
        console.log("DATA SNAPSHOT:", JSON.stringify(data, null, 2))
    }
    console.log("--- DEBUG END ---")
}

run()
