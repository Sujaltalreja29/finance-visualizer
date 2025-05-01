import dbConnect from '@/lib/dbConnect';
import {Transaction} from '@/models/model';

export async function POST(request:Request) {
  await dbConnect();

  try {
    const {name ,type , amount, user , color} = await request.json();

    const Create = new Transaction({
        name,
        type,
        amount,
        user,
        color
    })
    
    await Create.save()
    // await Create.save(function (err) {
    //     if (!err) return res.json(Create);
    //     return res.status(400).json({ message: `Error while creating categories ${err}` });
    // });
    return Response.json({
      success: true,
      message : "Transaction Created",
        },
        { status: 200 });
  } catch (error) {
    console.error('Error creating Transaction:', error);
    return Response.json(
      {
        success: false,
        message: 'Error creating Transaction',
      },
      { status: 500 })
  }
}