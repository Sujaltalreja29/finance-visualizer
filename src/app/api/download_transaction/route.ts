// app/api/transactions/download/route.js
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import {Transaction} from '@/models/model';
import * as XLSX from 'xlsx';

export async function POST(req:any) {
  try {
    await dbConnect();
    
    const { userId, startDate, endDate } = await req.json();

    // Validate required parameters
    if (!userId || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Create date objects for start and end dates
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    // Query transactions
    const transactions = await Transaction.find({
      user: userId,
      date: {
        $gte: start,
        $lte: end
      }
    }).sort({ date: -1 });

    // Transform data for Excel
    const excelData = transactions.map(t => ({
      Date: new Date(t.date).toLocaleDateString(),
      Name: t.name,
      Type: t.type,
      Amount: t.amount,
      Color: t.color
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Transactions');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Return Excel file
    return new NextResponse(excelBuffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename=transactions-${startDate}-to-${endDate}.xlsx`
      }
    });

  } catch (error) {
    console.error('Download error:', error);
    return NextResponse.json(
      { error: 'Failed to download transactions' },
      { status: 500 }
    );
  }
}