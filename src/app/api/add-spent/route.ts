import dbConnect from '@/lib/dbConnect';
import UserModel from '@/models/model';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    try {
        // Connect to the database
        await dbConnect();

        // Parse the JSON request body
        const { userId, spent } = await request.json();
        // Fetch the user's current spent value
        const user = await UserModel.findById(userId);
        if (!user) {
            return NextResponse.json({ success: false, error: 'User not found' });
        }

        // Update the user's spent value
        const updatedUser = await UserModel.findByIdAndUpdate(
            userId,
            { spent: Number(user.spent) + Number(spent) }, // Add the new spent value to the existing one
            { new: true } // Return the updated document
        );

        // Return a success response with the updated user
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error) {
        console.error('Error updating spent:', error);
        return NextResponse.json({ success: false, error: 'Failed to update spent' });
    }
}
