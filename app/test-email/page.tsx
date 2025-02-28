"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { sendOrderConfirmationEmailByReference, sendShippingConfirmationEmailByReference } from '@/app/actions/email-actions';
import { updateOrderStatus } from '@/lib/orders';

export default function TestEmailPage() {
  const [orderReference, setOrderReference] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // For shipping confirmation
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('usps');
  const [trackingUrl, setTrackingUrl] = useState('');

  const handleOrderConfirmationTest = async () => {
    if (!orderReference) {
      alert("Please enter an order reference");
      return;
    }

    setLoading(true);
    try {
      // First update the order with the test email if provided
      if (email) {
        await fetch('/api/test/update-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            orderReference,
            email
          }),
        });
      }
      
      // Then send the order confirmation email using the server action
      const result = await sendOrderConfirmationEmailByReference(orderReference);
      
      if (result.success) {
        alert("Order confirmation email sent successfully");
      } else {
        throw new Error(result.error || 'Failed to send email');
      }
    } catch (error: any) {
      alert(error.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  const handleShippingConfirmationTest = async () => {
    if (!orderReference || !trackingNumber) {
      alert("Please enter an order reference and tracking number");
      return;
    }

    setLoading(true);
    try {
      // First update the order with the test email if provided
      if (email) {
        await fetch('/api/test/update-order-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            orderReference,
            email
          }),
        });
      }
      
      // Then update the order status to shipped with tracking info
      const updatedOrder = await updateOrderStatus(orderReference, 'shipped', {
        trackingNumber,
        trackingUrl,
        carrier
      });
      
      if (updatedOrder) {
        // Send shipping confirmation email
        const result = await sendShippingConfirmationEmailByReference(orderReference);
        
        if (result.success) {
          alert("Order marked as shipped and shipping confirmation email sent");
        } else {
          throw new Error(result.error || 'Failed to send shipping confirmation email');
        }
      } else {
        throw new Error('Failed to update order status');
      }
    } catch (error: any) {
      alert(error.message || "Failed to send email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Email Testing Tool</h1>
      <p className="text-gray-600 mb-8">
        Use this page to test the email functionality of the application.
      </p>
      
      <Tabs defaultValue="order-confirmation">
        <TabsList className="mb-6">
          <TabsTrigger value="order-confirmation">Order Confirmation</TabsTrigger>
          <TabsTrigger value="shipping-confirmation">Shipping Confirmation</TabsTrigger>
        </TabsList>
        
        <TabsContent value="order-confirmation">
          <Card>
            <CardHeader>
              <CardTitle>Test Order Confirmation Email</CardTitle>
              <CardDescription>
                Send a test order confirmation email for an existing order.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderReference">Order Reference</Label>
                <Input 
                  id="orderReference" 
                  placeholder="e.g., order_123456" 
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Test Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="If provided, will update the order with this email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  If provided, the order will be updated with this email address before sending the confirmation.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleOrderConfirmationTest} 
                disabled={loading || !orderReference}
              >
                {loading ? 'Sending...' : 'Send Test Email'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="shipping-confirmation">
          <Card>
            <CardHeader>
              <CardTitle>Test Shipping Confirmation Email</CardTitle>
              <CardDescription>
                Mark an order as shipped and send a shipping confirmation email.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="shippingOrderReference">Order Reference</Label>
                <Input 
                  id="shippingOrderReference" 
                  placeholder="e.g., order_123456" 
                  value={orderReference}
                  onChange={(e) => setOrderReference(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Test Email (Optional)</Label>
                <Input 
                  id="email" 
                  type="email"
                  placeholder="If provided, will update the order with this email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingNumber">Tracking Number</Label>
                <Input 
                  id="trackingNumber" 
                  placeholder="e.g., 1Z999AA10123456784" 
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carrier">Carrier</Label>
                <select
                  id="carrier"
                  className="w-full px-3 py-2 border rounded-md"
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                >
                  <option value="usps">USPS</option>
                  <option value="ups">UPS</option>
                  <option value="fedex">FedEx</option>
                  <option value="dhl">DHL</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingUrl">Tracking URL (Optional)</Label>
                <Input 
                  id="trackingUrl" 
                  placeholder="Custom tracking URL if needed" 
                  value={trackingUrl}
                  onChange={(e) => setTrackingUrl(e.target.value)}
                />
                <p className="text-xs text-gray-500">
                  If left blank, a default tracking URL will be generated based on the carrier and tracking number.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleShippingConfirmationTest} 
                disabled={loading || !orderReference || !trackingNumber}
              >
                {loading ? 'Sending...' : 'Mark as Shipped & Send Email'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 