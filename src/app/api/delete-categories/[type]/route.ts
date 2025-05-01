import dbConnect from '@/lib/dbConnect';
import {Categories} from '@/models/model';

export async function DELETE(request:Request,context: { params: { type: string } }) {
    const {type} = await context.params;
    console.log(type);
    await dbConnect();
    try {
        
        const Delete = await Categories.deleteOne({
            type
        })
        if(Delete.deletedCount === 0 ){
            return Response.json({
                success: false,
                message : "Category not found",
            },
            { status: 404 });
        }
        return Response.json({
            success: true,
            message : "Category Deleted",
        },
        { status: 200 });
    } catch (error) {
        console.log('Error deleting category:', error);
        return Response.json({
            success: false,
            message : "Error while deleting category",
        },
        { status: 500 });
    }
}