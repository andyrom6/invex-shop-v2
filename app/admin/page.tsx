"use client";

import { motion } from "framer-motion";
import {
  Gift,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  FileEdit,
  LayoutDashboard,
  Package,
  Tag,
  Store,
  ArrowLeft,
  LogOut,
  MessageSquare,
  ShoppingBag,
  CreditCard,
  BarChart2,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getOrders } from '@/lib/orders';

interface AdminSection {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  path: string;
  comingSoon?: boolean;
}

const sections: AdminSection[] = [
  {
    id: "orders",
    name: "Orders",
    icon: <ShoppingCart className="w-6 h-6" />, 
    description: "Manage customer orders",
    path: "/admin/orders",
  },
  {
    id: "products",
    name: "Products",
    icon: <Package className="w-6 h-6" />,
    description: "Manage products and inventory",
    path: "/admin/products",
  },
  {
    id: "carousel",
    name: "Carousel",
    icon: <FileEdit className="w-6 h-6" />,
    description: "Manage homepage carousel images",
    path: "/admin/carousel",
  },
  {
    id: "sale-banner",
    name: "Sale Banner",
    icon: <Tag className="w-6 h-6" />,
    description: "Customize the sale banner",
    path: "/admin/sale-banner",
  },
  {
    id: "reviews",
    name: "Customer Reviews",
    icon: <MessageSquare className="w-6 h-6" />,
    description: "Manage customer reviews and testimonials",
    path: "/admin/reviews",
  },
  {
    id: "customers",
    name: "Customers",
    icon: <Users className="w-6 h-6" />,
    description: "View and manage customer data",
    path: "/admin/customers",
  },
];

const AdminDashboard = () => {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [orderCount, setOrderCount] = useState(0);
  const [loadingOrderCount, setLoadingOrderCount] = useState(true);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [loading, user, router]);

  useEffect(() => {
    async function fetchOrderCount() {
      try {
        const orders = await getOrders();
        setOrderCount(orders.length);
      } catch (error) {
        console.error('Error fetching order count:', error);
      } finally {
        setLoadingOrderCount(false);
      }
    }
    fetchOrderCount();
  }, []);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800">
        <motion.div 
          className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!user) {
    return null;
  }

  const adminModules = [
    {
      title: 'Orders',
      description: 'View and manage customer orders',
      icon: <ShoppingBag className="w-10 h-10 text-white" />,
      link: '/admin/orders',
      count: orderCount,
      color: 'from-indigo-500 to-blue-600',
      bgColor: 'bg-indigo-600'
    },
    {
      title: 'Products',
      description: 'Manage your product catalog',
      icon: <Package className="w-10 h-10 text-white" />,
      link: '/admin/products',
      color: 'from-violet-500 to-purple-600',
      bgColor: 'bg-violet-600'
    },
    {
      title: 'Customers',
      description: 'View and manage customer data',
      icon: <Users className="w-10 h-10 text-white" />,
      link: '/admin/customers',
      color: 'from-blue-500 to-sky-600',
      bgColor: 'bg-blue-600'
    },
    {
      title: 'Carousel',
      description: 'Manage carousel and sale banner',
      icon: <FileEdit className="w-10 h-10 text-white" />,
      link: '/admin/carousel',
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-600'
    },
    {
      title: 'Reviews',
      description: 'Manage customer reviews',
      icon: <MessageSquare className="w-10 h-10 text-white" />,
      link: '/admin/reviews',
      color: 'from-amber-500 to-orange-600',
      bgColor: 'bg-amber-600'
    },
    {
      title: 'Sale Banner',
      description: 'Manage sale banner',
      icon: <Tag className="w-10 h-10 text-white" />,
      link: '/admin/sale-banner',
      color: 'from-red-500 to-orange-600',
      bgColor: 'bg-red-600'
    }
  ];

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Admin Panel
          </h2>
          <div className="flex items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
            {user.email}
          </div>
        </div>
        
        <div className="p-4 flex-1">
          <Link 
            href="/"
            className="flex items-center space-x-2 p-3 mb-6 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-300"
          >
            <ArrowLeft className="w-6 h-6" />
            <span>Back to Store</span>
          </Link>
          
          <nav className="space-y-1">
            {sections.map((section) => (
              <Link
                key={section.id}
                href={!section.comingSoon ? section.path : "#"}
                className={`flex items-center justify-between p-3 rounded-lg transition-colors duration-300 ${
                  section.comingSoon
                    ? "text-gray-400 dark:text-gray-500 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-200 hover:bg-indigo-50 dark:hover:bg-indigo-900 hover:text-indigo-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${section.comingSoon ? "text-gray-400 dark:text-gray-500" : "text-indigo-600"}`}>
                    {section.icon}
                  </div>
                  <span>{section.name}</span>
                </div>
                {section.comingSoon ? (
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">Soon</span>
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                )}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <button 
            onClick={signOut}
            className="flex items-center space-x-2 w-full p-3 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900 hover:text-red-600 transition-colors duration-300"
          >
            <LogOut className="w-6 h-6" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm p-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <Link 
              href="/"
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 transition-colors duration-300 text-white"
            >
              <Store className="w-6 h-6" />
              <span>View Store</span>
            </Link>
          </div>
        </header>
        
        <main className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {adminModules.map((module, index) => (
              <Link 
                key={index} 
                href={module.link}
                className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-shadow duration-300 border border-gray-200 dark:border-gray-700"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl" style={{ backgroundImage: `linear-gradient(to right, #6366f1, #8b5cf6)` }}></div>
                <div className="p-6">
                  <div className="flex items-start">
                    <div className={`flex-shrink-0 p-4 rounded-xl ${module.bgColor} mr-5 shadow-lg`}>
                      {module.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-lg font-semibold mb-2 text-gray-800 dark:text-gray-200">{module.title}</h2>
                      <p className="text-gray-500 dark:text-gray-400 mb-4 text-sm">{module.description}</p>
                      {module.count !== undefined && (
                        <div className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm inline-flex items-center">
                          {loadingOrderCount ? (
                            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mr-2"></span>
                          ) : (
                            <span>{module.count}</span>
                          )}
                          {loadingOrderCount ? ' Loading...' : ' items'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <ChevronRight className="w-6 h-6 text-indigo-500" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
