import dbConnect from '@/lib/dbConnect';
import {Categories} from '@/models/model';

export async function GET() {
  await dbConnect();

  try {
    const categories = await Categories.find({});
    // let filter = await data.map(v => Object.assign({}, { type: v.type, color: v.color }));
    return Response.json({
      success: true,
      data: categories,
        },
        { status: 200 });
  } catch (error) {
    console.error('Error getting categories:', error);
    return Response.json(
      {
        success: false,
        message: 'Error getting categories',
      },
      { status: 500 })
  }
}




