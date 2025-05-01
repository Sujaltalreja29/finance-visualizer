import { NextResponse } from 'next/server';
import { PREDEFINED_CATEGORIES } from '@/models/model';

export async function GET() {
  try {
    // Return the predefined categories
    return NextResponse.json(PREDEFINED_CATEGORIES);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}