import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { Budgets } from '@/models/model';

export async function GET() {
  try {
    await dbConnect();
    const budgets = await Budgets.find({});
    return NextResponse.json(budgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json({ error: 'Failed to fetch budgets' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    await dbConnect();
    const budget = await Budgets.create(data);
    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json({ error: 'Failed to create budget' }, { status: 500 });
  }
}