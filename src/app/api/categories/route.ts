import { NextResponse } from 'next/server';
import { categoryService } from '@/lib/services/category.service';
import { CategoryFormData } from '@/lib/types/category';
import { getCurrentUser } from '@/lib/utils/auth';

// GET /api/categories
export async function GET() {
  try {
    const categories = await categoryService.getAll();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/categories
export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data: CategoryFormData = await request.json();
    const category = await categoryService.create(data);
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
} 