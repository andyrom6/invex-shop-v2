"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, RefreshCw, Search, Filter, ChevronDown, User, Mail, Calendar, DollarSign, ShoppingBag, ExternalLink, X, UserCheck, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface Customer {
  id: string;
  name: string | null;
  email: string | null;
  phone?: string | null;
  created?: number;
  metadata?: Record<string, any>;
  orders_count?: number;
  total_spent?: number;
  is_guest?: boolean;
  default_address?: {
    city?: string;
    country?: string;
    line1?: string;
    line2?: string;
    postal_code?: string;
    state?: string;
  };
}

export default function CustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest_spent' | 'most_orders'>('newest');
  const [expandedCustomer, setExpandedCustomer] = useState<string | null>(null);
  const [showGuestCustomers, setShowGuestCustomers] = useState(true);

  // Format date
  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format currency
  const formatCurrency = (amount: number | undefined) => {
    if (amount === undefined) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  async function fetchCustomers() {
    setLoading(true);
    setError(null);
    
    try {
      const loadingToast = toast.loading('Loading customers...');
      const response = await fetch('/api/stripe/customers');
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      toast.dismiss(loadingToast);
      setCustomers(data.customers);
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      setError(error.message || 'Failed to fetch customers');
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Filter customers based on search term and guest filter
  const filteredCustomers = customers.filter(customer => {
    // First filter by guest/registered status
    if (!showGuestCustomers && customer.is_guest) {
      return false;
    }
    
    // Then filter by search term
    if (searchTerm === '') return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      (customer.name && customer.name.toLowerCase().includes(searchLower)) ||
      (customer.email && customer.email.toLowerCase().includes(searchLower)) ||
      (customer.default_address?.city && customer.default_address.city.toLowerCase().includes(searchLower)) ||
      (customer.default_address?.country && customer.default_address.country.toLowerCase().includes(searchLower))
    );
  });

  // Sort customers based on selected order
  const sortedCustomers = [...filteredCustomers].sort((a, b) => {
    switch (sortOrder) {
      case 'newest':
        return (b.created || 0) - (a.created || 0);
      case 'oldest':
        return (a.created || 0) - (b.created || 0);
      case 'highest_spent':
        return (b.total_spent || 0) - (a.total_spent || 0);
      case 'most_orders':
        return (b.orders_count || 0) - (a.orders_count || 0);
      default:
        return 0;
    }
  });

  // Count statistics
  const registeredCount = customers.filter(c => !c.is_guest).length;
  const guestCount = customers.filter(c => c.is_guest).length;
  const totalOrders = customers.reduce((sum, c) => sum + (c.orders_count || 0), 0);
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_spent || 0), 0);
  const newThisMonth = customers.filter(c => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();
    const customerDate = c.created ? new Date(c.created * 1000) : null;
    return customerDate && customerDate.getMonth() === thisMonth && customerDate.getFullYear() === thisYear;
  }).length;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Link href="/admin" className="flex items-center justify-center h-10 w-10 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 text-indigo-600 dark:text-indigo-400">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">Customers</h1>
          </div>
          
          <button 
            onClick={fetchCustomers}
            className="flex items-center bg-white dark:bg-gray-800 text-indigo-600 dark:text-indigo-400 px-5 py-2.5 rounded-xl hover:bg-indigo-50 dark:hover:bg-gray-700 transition-all shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 font-medium"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 mb-8 border border-gray-100 dark:border-gray-700 backdrop-blur-sm">
          <div className="flex items-center mb-6">
            <div className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-xl mr-4">
              <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Customer Management</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">View and manage your customer base</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-900/10 rounded-xl p-6 border border-indigo-100 dark:border-indigo-900/50 transition-all hover:shadow-md">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center mr-3">
                  <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Total Customers</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{customers.length}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-900/50 transition-all hover:shadow-md">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mr-3">
                  <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-purple-600 dark:text-purple-400 font-medium">Registered</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{registeredCount}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-900/10 rounded-xl p-6 border border-rose-100 dark:border-rose-900/50 transition-all hover:shadow-md">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-lg bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center mr-3">
                  <UserX className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div>
                  <p className="text-sm text-rose-600 dark:text-rose-400 font-medium">Guest Customers</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{guestCount}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-900/10 rounded-xl p-6 border border-amber-100 dark:border-amber-900/50 transition-all hover:shadow-md">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center mr-3">
                  <ShoppingBag className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">Total Orders</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{totalOrders}</h3>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-900/10 rounded-xl p-6 border border-emerald-100 dark:border-emerald-900/50 transition-all hover:shadow-md">
              <div className="flex items-start mb-3">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center mr-3">
                  <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 font-medium">Total Revenue</p>
                  <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{formatCurrency(totalRevenue)}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 mb-8 border border-gray-100 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search by name, email or location"
                className="block w-full pl-12 pr-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="relative w-full md:w-64">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <select
                className="block w-full pl-12 pr-12 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 appearance-none focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
              >
                <option value="newest">Newest Customers</option>
                <option value="oldest">Oldest Customers</option>
                <option value="highest_spent">Highest Spenders</option>
                <option value="most_orders">Most Orders</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-400 dark:text-gray-500">
                <ChevronDown className="w-5 h-5" />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 px-4">
              <input
                type="checkbox" 
                id="showGuests"
                checked={showGuestCustomers}
                onChange={(e) => setShowGuestCustomers(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
              />
              <label htmlFor="showGuests" className="text-sm text-gray-700 dark:text-gray-300">
                Show Guest Customers
              </label>
            </div>
          </div>
        </div>

        {/* Customers Table */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Customer
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Email
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Join Date
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <ShoppingBag className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Orders
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-indigo-900/30 p-1.5 rounded-lg mr-2">
                        <DollarSign className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      Total Spent
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mb-4"></div>
                        <p className="text-gray-500 dark:text-gray-400">Loading customers...</p>
                      </div>
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center">
                      <div className="bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-6 rounded-xl border border-red-100 dark:border-red-900/30 max-w-lg mx-auto">
                        <div className="flex items-center justify-center mb-3">
                          <div className="bg-red-100 dark:bg-red-900/30 p-2 rounded-full">
                            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
                          </div>
                        </div>
                        <p className="font-medium text-center">{error}</p>
                        <div className="flex justify-center mt-4">
                          <button 
                            onClick={fetchCustomers}
                            className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            Try again
                          </button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : sortedCustomers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center">
                      {searchTerm ? (
                        <div className="max-w-lg mx-auto py-6 flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-4">
                            <Search className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">No customers found</p>
                          <p className="text-gray-500 dark:text-gray-400">Try adjusting your search criteria</p>
                        </div>
                      ) : (
                        <div className="max-w-lg mx-auto py-6 flex flex-col items-center">
                          <div className="bg-gray-100 dark:bg-gray-700/50 p-4 rounded-full mb-4">
                            <User className="w-8 h-8 text-gray-400" />
                          </div>
                          <p className="font-medium text-gray-900 dark:text-white text-lg mb-1">No customers yet</p>
                          <p className="text-gray-500 dark:text-gray-400">Your customer list will appear here</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  sortedCustomers.map((customer) => (
                    <tr 
                      key={customer.id} 
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                        customer.is_guest ? 'bg-rose-50/30 dark:bg-rose-900/10' : ''
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`flex-shrink-0 h-10 w-10 rounded-full ${
                            customer.is_guest 
                              ? 'bg-rose-100 dark:bg-rose-900/30' 
                              : 'bg-indigo-100 dark:bg-indigo-900/30'
                          } flex items-center justify-center overflow-hidden`}>
                            {customer.is_guest ? (
                              <UserX className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                            ) : (
                              <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="flex items-center">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {customer.name || 'No Name'}
                              </div>
                              {customer.is_guest && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-300">
                                  Guest
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {customer.default_address?.city && customer.default_address?.country 
                                ? `${customer.default_address.city}, ${customer.default_address.country}`
                                : 'No location'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{customer.email || 'No email'}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {customer.phone || 'No phone'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{formatDate(customer.created)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {customer.orders_count || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(customer.total_spent)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2 justify-end">
                          {!customer.is_guest ? (
                            <a 
                              href={`https://dashboard.stripe.com/customers/${customer.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors flex items-center gap-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                              <span className="hidden sm:inline">View in Stripe</span>
                            </a>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500 text-xs italic px-3 py-1.5">
                              Guest Customer
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 