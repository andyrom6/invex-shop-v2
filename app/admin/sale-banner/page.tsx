"use client"

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash, Plus, Save, Timer, AlertCircle, Eye, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from 'react-hot-toast';
import { SaleBannerData } from '@/app/api/sale-banner/route';
import { SaleBanner } from '@/components/sale-banner';
import { useRouter } from 'next/navigation';

export default function SaleBannerAdminPage() {
  const router = useRouter();
  const [bannerData, setBannerData] = useState<SaleBannerData>({
    enabled: true,
    messages: [""],
    backgroundColor: "#000000",
    textColor: "#FFFFFF",
    showTimer: true,
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  useEffect(() => {
    fetchBannerData();
  }, []);

  async function fetchBannerData() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/sale-banner');
      if (!response.ok) throw new Error('Failed to fetch banner data');
      
      const data = await response.json();
      setBannerData(data);
    } catch (error) {
      toast.error('Failed to load sale banner data');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSave() {
    try {
      setIsSaving(true);
      const response = await fetch('/api/sale-banner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bannerData),
      });

      if (!response.ok) throw new Error('Failed to update banner');
      
      toast.success('Sale banner updated successfully');
    } catch (error) {
      toast.error('Failed to update sale banner');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  }

  function addMessage() {
    setBannerData({
      ...bannerData,
      messages: [...bannerData.messages, ""]
    });
  }

  function removeMessage(index: number) {
    const newMessages = [...bannerData.messages];
    newMessages.splice(index, 1);
    setBannerData({
      ...bannerData,
      messages: newMessages
    });
  }

  function updateMessage(index: number, value: string) {
    const newMessages = [...bannerData.messages];
    newMessages[index] = value;
    setBannerData({
      ...bannerData,
      messages: newMessages
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <motion.div 
          className="w-20 h-20 rounded-full border-4 border-blue-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-8 py-6">
        <button
          onClick={() => router.push('/admin')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </button>
        
        <div className="flex items-center justify-between mb-8 border-b pb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Sale Banner</h1>
            <p className="text-gray-600 mt-1">
              Customize the sale banner that appears at the top of your store
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              size="lg"
              className="gap-2 border-2"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <Eye className="w-5 h-5" />
              {previewMode ? "Hide Preview" : "Show Preview"}
            </Button>
            <Button 
              onClick={handleSave}
              size="lg"
              className="bg-black hover:bg-gray-800 text-white gap-2"
              disabled={isSaving}
            >
              <Save className="w-5 h-5" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>

        {/* Preview Mode */}
        {previewMode && (
          <div className="mb-8">
            <SaleBanner data={bannerData} className="relative w-full" />
          </div>
        )}

        <Tabs defaultValue="content" className="space-y-8">
          <TabsList className="grid grid-cols-3 w-full max-w-md">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Content Tab */}
          <TabsContent value="content" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Messages</CardTitle>
                <CardDescription>
                  Add the messages you want to display in the sale banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {bannerData.messages.map((message, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Input
                      value={message}
                      onChange={(e) => updateMessage(index, e.target.value)}
                      placeholder={`Message ${index + 1}`}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => removeMessage(index)}
                      disabled={bannerData.messages.length <= 1}
                      className="shrink-0"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                
                <Button
                  variant="outline"
                  onClick={addMessage}
                  className="w-full mt-2 border-dashed"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Appearance</CardTitle>
                <CardDescription>
                  Customize the colors of your sale banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="bgColor">Background Color</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: bannerData.backgroundColor }}
                      />
                      <Input
                        id="bgColor"
                        type="text"
                        value={bannerData.backgroundColor}
                        onChange={(e) => setBannerData({
                          ...bannerData,
                          backgroundColor: e.target.value
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex gap-3">
                      <div 
                        className="w-10 h-10 rounded-md border"
                        style={{ backgroundColor: bannerData.textColor }}
                      />
                      <Input
                        id="textColor"
                        type="text"
                        value={bannerData.textColor}
                        onChange={(e) => setBannerData({
                          ...bannerData,
                          textColor: e.target.value
                        })}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm font-medium">Preview</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setPreviewMode(true)}
                    >
                      Show Full Preview
                    </Button>
                  </div>
                  
                  <div className="mt-3 rounded-md overflow-hidden">
                    <SaleBanner 
                      data={{...bannerData, enabled: true}} 
                      className="relative w-full" 
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Banner Settings</CardTitle>
                <CardDescription>
                  Configure general settings for the sale banner
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="banner-enabled">Enable Sale Banner</Label>
                    <p className="text-sm text-gray-500">
                      Show or hide the banner on your site
                    </p>
                  </div>
                  <Switch
                    id="banner-enabled"
                    checked={bannerData.enabled}
                    onCheckedChange={(checked) => setBannerData({
                      ...bannerData,
                      enabled: checked
                    })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-timer">Show Countdown Timer</Label>
                    <p className="text-sm text-gray-500">
                      Display a countdown timer in the banner
                    </p>
                  </div>
                  <Switch
                    id="show-timer"
                    checked={bannerData.showTimer}
                    onCheckedChange={(checked) => setBannerData({
                      ...bannerData,
                      showTimer: checked
                    })}
                  />
                </div>
                
                {bannerData.showTimer && (
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="datetime-local"
                      value={bannerData.endDate ? new Date(bannerData.endDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setBannerData({
                        ...bannerData,
                        endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined
                      })}
                    />
                    <p className="text-sm text-gray-500">
                      The date and time when the sale ends
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 