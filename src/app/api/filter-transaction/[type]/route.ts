import dbConnect from '@/lib/dbConnect';
import {Transaction} from '@/models/model';

export async function POST(request:Request,context: { params: { type: string } }) {
    await dbConnect();
    const { type } = context.params;
    try {
      const transactions = await Transaction.find({type});
      // let filter = await data.map(v => Object.assign({}, { type: v.type, color: v.color }));
      return Response.json({
        success: true,
        data: transactions,
          },
          { status: 200 });
    } catch (error) {
      console.error('Error getting transactions:', error);
      return Response.json(
        {
          success: false,
          message: 'Error getting transactions',
        },
        { status: 500 })
    }
  }