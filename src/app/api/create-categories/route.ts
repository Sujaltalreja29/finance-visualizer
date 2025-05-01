import dbConnect from '@/lib/dbConnect';
import {Categories} from '@/models/model';

export async function POST(request:Request) {
  await dbConnect();

  try {
    const {type , color} = await request.json();

    const Create = new Categories({
        type,
        color
    })

    await Create.save()
    // await Create.save(function (err) {
    //     if (!err) return res.json(Create);
    //     return res.status(400).json({ message: `Error while creating categories ${err}` });
    // });
    return Response.json({
      success: true,
      message : "Category Created",
        },
        { status: 200 });
  } catch (error) {
    console.error('Error creating category:', error);
    return Response.json(
      {
        success: false,
        message: 'Error creating category',
      },
      { status: 500 })
  }
}