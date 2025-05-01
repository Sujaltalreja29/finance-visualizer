import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/model';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        await dbConnect();
        const { userId, budget } = await request.json();
        
        const updatedUser = await UserModel.findByIdAndUpdate(
          userId,
          { budget: budget },
          { new: true }
        );
    
        return NextResponse.json({ success: true, user: updatedUser });
      } catch (error) {
        return NextResponse.json({ success: false, error: 'Failed to update budget' });
      }
    
}