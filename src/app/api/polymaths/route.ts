// src/app/api/polymaths/route.ts

import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables!');
}

const supabase = supabaseUrl && supabaseKey 
  ? createClient(supabaseUrl, supabaseKey)
  : null;

export async function GET() {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    console.log('📊 Fetching polymaths from Supabase...');

    // Simple query - get all columns, no ordering assumption
    const { data, error } = await supabase
      .from('polymaths')
      .select('*');

    if (error) {
      console.error('❌ Supabase error:', error);
      throw error;
    }

    console.log(`✅ Fetched ${data?.length || 0} polymaths`);
    
    // Log first item to see what columns we actually have
    if (data && data.length > 0) {
      console.log('📋 Available columns:', Object.keys(data[0]).join(', '));
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('❌ API Route Error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch polymaths',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';