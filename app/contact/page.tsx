"use client";

import React, { useState } from 'react';
import { Mail, MessageCircle, Clock, ArrowRight, CheckCircle, Copy, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { toast } from 'react-hot-toast';

const SUPPORT_EMAIL = "atresellllc@gmail.com";
const SUPPORT_HOURS = "Monday-Friday, 9am-5pm EST";
const DISCORD_URL = "https://discord.gg/wDEtcYVeEk";

export default function ContactPage() {
  const [copied, setCopied] = useState(false);
  
  const copyEmail = () => {
    navigator.clipboard.writeText(SUPPORT_EMAIL);
    setCopied(true);
    toast.success('Email copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/30 to-purple-500/30 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-blue-500/30 to-teal-500/30 rounded-full blur-3xl opacity-30 dark:opacity-20"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 relative z-10">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            className="mt-4 text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            We're here to help! Reach out through our support channels.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Email Card */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <div className="p-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <Mail className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Email Support</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Send us an email and we'll get back to you during business hours.
              </p>
              
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300 font-medium">{SUPPORT_EMAIL}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={copyEmail}
                  className="flex items-center"
                >
                  {copied ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <Copy className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                  )}
                </Button>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Clock className="h-4 w-4 mr-2" />
                <span>Support Hours: {SUPPORT_HOURS}</span>
              </div>
              
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => window.location.href = `mailto:${SUPPORT_EMAIL}`}
              >
                Email Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
          
          {/* Discord Card */}
          <motion.div 
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            <div className="p-8">
              <div className="bg-indigo-50 dark:bg-indigo-900/30 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                <MessageCircle className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Discord Community</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                Join our Discord for faster responses and community support.
              </p>
              
              <div className="bg-[#5865F2]/10 dark:bg-[#5865F2]/20 rounded-xl p-4 mb-6">
                <div className="flex items-center mb-3">
                  <div className="w-8 h-8 relative mr-3">
                    <svg viewBox="0 -28.5 256 256" version="1.1" preserveAspectRatio="xMidYMid" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" className="text-[#5865F2]">
                      <g>
                        <path d="M216.856339,16.5966031 C200.285002,8.84328665 182.566144,3.2084988 164.041564,0 C161.766523,4.11318106 159.108624,9.64549908 157.276099,14.0464379 C137.583995,11.0849896 118.072967,11.0849896 98.7430163,14.0464379 C96.9108417,9.64549908 94.1925838,4.11318106 91.8971895,0 C73.3526068,3.2084988 55.6133949,8.86399117 39.0420583,16.6376612 C5.61752293,67.146514 -3.4433191,116.400813 1.08711069,164.955721 C23.2560196,181.510915 44.7403634,191.567697 65.8621325,198.148576 C71.0772151,190.971126 75.7283628,183.341335 79.7352139,175.300261 C72.104019,172.400575 64.7949724,168.822202 57.8887866,164.667963 C59.7209612,163.310589 61.5131304,161.891452 63.2445898,160.431257 C105.36741,180.133187 151.134928,180.133187 192.754523,160.431257 C194.506336,161.891452 196.298154,163.310589 198.110326,164.667963 C191.183787,168.842556 183.854737,172.420929 176.223542,175.320965 C180.230393,183.341335 184.861538,190.991831 190.096624,198.16893 C211.238746,191.588051 232.743023,181.531619 254.911949,164.955721 C260.227747,108.668201 245.831087,59.8662432 216.856339,16.5966031 Z M85.4738752,135.09489 C72.8290281,135.09489 62.4592217,123.290155 62.4592217,108.914901 C62.4592217,94.5396472 72.607595,82.7145587 85.4738752,82.7145587 C98.3405064,82.7145587 108.709962,94.5189427 108.488529,108.914901 C108.508531,123.290155 98.3405064,135.09489 85.4738752,135.09489 Z M170.525237,135.09489 C157.88039,135.09489 147.510584,123.290155 147.510584,108.914901 C147.510584,94.5396472 157.658606,82.7145587 170.525237,82.7145587 C183.391518,82.7145587 193.761324,94.5189427 193.539891,108.914901 C193.539891,123.290155 183.391518,135.09489 170.525237,135.09489 Z" fill="#5865F2" fillRule="nonzero"></path>
                      </g>
                    </svg>
                  </div>
                  <span className="text-[#5865F2] dark:text-[#5865F2] font-semibold">Discord Server</span>
                </div>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Our Discord community is the fastest way to get help and connect with other users.
                </p>
              </div>
              
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                <Clock className="h-4 w-4 mr-2" />
                <span>Typically faster response than email</span>
              </div>
              
              <Link href={DISCORD_URL} target="_blank" rel="noopener noreferrer">
                <Button className="w-full bg-[#5865F2] hover:bg-[#4752C4] text-white">
                  Join Our Discord
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>

        {/* FAQ Section */}
        <motion.div 
          className="max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white text-center mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What are your response times?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We typically respond to emails within 24 hours during business hours. For faster support, our Discord community is usually more responsive.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                How can I track my order?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                You can track your order by logging into your account and viewing your order history. If you have any issues, feel free to reach out via email or Discord.
              </p>
            </div>
            
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                What is your return policy?
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                We dont offer any returns if the damage is out of our control.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 