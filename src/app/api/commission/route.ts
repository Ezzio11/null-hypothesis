// src/app/api/commission/route.ts
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

// Initialize Supabase Client (Server-side)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!; // Use Service Role to bypass RLS if needed, or Anon if policy allows
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { service, budget, details, contact, contactType } = body;

    // Validation
    if (!contact || !details) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert into Database
    const { data, error } = await supabase
      .from('commissions')
      .insert([
        { 
          service, 
          budget, 
          details, 
          contact, 
          contact_type: contactType 
        }
      ])
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, id: data[0].id });

  } catch (err: any) {
    console.error("Commission Error:", err);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}