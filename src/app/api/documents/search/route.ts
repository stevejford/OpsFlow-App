import { NextResponse } from 'next/server';
import { db } from '@/lib/db/neon-operations';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const folderId = searchParams.get('folderId');
    const type = searchParams.get('type');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query (q) is required' },
        { status: 400 }
      );
    }

    // Basic search using the existing search method
    let documents = await db.documentFiles.search(query, folderId || undefined);
    
    // Apply additional filters if provided
    if (type) {
      documents = documents.filter(doc => doc.type.toLowerCase().includes(type.toLowerCase()));
    }
    
    if (dateFrom) {
      const fromDate = new Date(dateFrom);
      documents = documents.filter(doc => new Date(doc.upload_date) >= fromDate);
    }
    
    if (dateTo) {
      const toDate = new Date(dateTo);
      documents = documents.filter(doc => new Date(doc.upload_date) <= toDate);
    }
    
    return NextResponse.json({
      query,
      results: documents,
      count: documents.length,
      filters: {
        folderId,
        type,
        dateFrom,
        dateTo
      }
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: 'Failed to search documents' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { 
      query, 
      folderId, 
      fileTypes, 
      dateRange, 
      sizeRange,
      sortBy,
      sortOrder 
    } = await request.json();
    
    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      );
    }

    // Start with basic search
    let documents = await db.documentFiles.search(query, folderId);
    
    // Apply file type filters
    if (fileTypes && Array.isArray(fileTypes) && fileTypes.length > 0) {
      documents = documents.filter(doc => 
        fileTypes.some(type => doc.type.toLowerCase().includes(type.toLowerCase()))
      );
    }
    
    // Apply date range filter
    if (dateRange) {
      if (dateRange.from) {
        const fromDate = new Date(dateRange.from);
        documents = documents.filter(doc => new Date(doc.upload_date) >= fromDate);
      }
      if (dateRange.to) {
        const toDate = new Date(dateRange.to);
        documents = documents.filter(doc => new Date(doc.upload_date) <= toDate);
      }
    }
    
    // Apply size range filter
    if (sizeRange) {
      if (sizeRange.min) {
        documents = documents.filter(doc => doc.size >= sizeRange.min);
      }
      if (sizeRange.max) {
        documents = documents.filter(doc => doc.size <= sizeRange.max);
      }
    }
    
    // Apply sorting
    if (sortBy) {
      documents.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortBy) {
          case 'name':
            aValue = a.name.toLowerCase();
            bValue = b.name.toLowerCase();
            break;
          case 'size':
            aValue = a.size;
            bValue = b.size;
            break;
          case 'type':
            aValue = a.type.toLowerCase();
            bValue = b.type.toLowerCase();
            break;
          case 'date':
          default:
            aValue = new Date(a.upload_date);
            bValue = new Date(b.upload_date);
            break;
        }
        
        if (aValue < bValue) return sortOrder === 'desc' ? 1 : -1;
        if (aValue > bValue) return sortOrder === 'desc' ? -1 : 1;
        return 0;
      });
    }
    
    return NextResponse.json({
      query,
      results: documents,
      count: documents.length,
      filters: {
        folderId,
        fileTypes,
        dateRange,
        sizeRange,
        sortBy,
        sortOrder
      }
    });
  } catch (error) {
    console.error('Error performing advanced search:', error);
    return NextResponse.json(
      { error: 'Failed to perform advanced search' },
      { status: 500 }
    );
  }
}
