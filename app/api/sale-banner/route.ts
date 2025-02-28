import { NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { logger } from '@/lib/logger';

// Define the sale banner data structure
export interface SaleBannerData {
  enabled: boolean;
  messages: string[];
  backgroundColor: string;
  textColor: string;
  showTimer: boolean;
  endDate?: string;
}

// Default sale banner data
const defaultSaleBanner: SaleBannerData = {
  enabled: true,
  messages: [
    "LIMITED TIME!",
    "20% OFF WHOLE STORE",
    "50% OFF ALL SUPPLIER BUNDLES",
    "INSTANT DELIVERY!"
  ],
  backgroundColor: "#000000",
  textColor: "#FFFFFF",
  showTimer: true,
  endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
};

export async function GET() {
  try {
    // Get sale banner data from Firebase
    const saleBannerRef = doc(db, 'settings', 'saleBanner');
    const saleBannerDoc = await getDoc(saleBannerRef);
    
    let saleBannerData: SaleBannerData;
    
    if (saleBannerDoc.exists()) {
      saleBannerData = saleBannerDoc.data() as SaleBannerData;
    } else {
      // If no document exists, create one with default values
      saleBannerData = defaultSaleBanner;
      await setDoc(saleBannerRef, saleBannerData);
      logger.info('Created default sale banner settings');
    }
    
    logger.success('Fetched sale banner settings');
    return NextResponse.json(saleBannerData);
  } catch (error) {
    logger.error('Error fetching sale banner settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sale banner settings' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Validate the data
    if (!data.messages || !Array.isArray(data.messages)) {
      return NextResponse.json(
        { error: 'Invalid data: messages must be an array' },
        { status: 400 }
      );
    }
    
    // Update the sale banner in Firebase
    const saleBannerRef = doc(db, 'settings', 'saleBanner');
    await setDoc(saleBannerRef, data);
    
    logger.success('Updated sale banner settings');
    return NextResponse.json({ success: true, data });
  } catch (error) {
    logger.error('Error updating sale banner settings:', error);
    return NextResponse.json(
      { error: 'Failed to update sale banner settings' },
      { status: 500 }
    );
  }
} 