'use client'
import { Search } from "lucide-react";
import { useState, useMemo } from "react";

export default function page() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("All Time");
  
  // Dummy data based on the screenshot
  const billingData = [
    {
      invoice_no: "INV-001",
      date: "Jan 15, 2025",
      plan: "Basic",
      amount: "$99.00",
      payment_method: "Visa_4525",
      status: "Completed"
    },
    {
      invoice_no: "INV-002",
      date: "Mar 21, 2025",
      plan: "Basic",
      amount: "$99.00",
      payment_method: "Visa_4525",
      status: "Completed"
    },
    {
      invoice_no: "INV-003",
      date: "May 3, 2024",
      plan: "Basic",
      amount: "$99.00",
      payment_method: "Visa_4525",
      status: "Completed"
    },
    {
      invoice_no: "INV-004",
      date: "Feb 11, 2025",
      plan: "Basic",
      amount: "$99.00",
      payment_method: "Visa_4525",
      status: "Completed"
    }
  ];

  // Helper function to convert date string to Date object
  const parseDate = (dateString) => {
    const months = {
      'jan': 0, 'feb': 1, 'mar': 2, 'apr': 3, 'may': 4, 'jun': 5,
      'jul': 6, 'aug': 7, 'sep': 8, 'oct': 9, 'nov': 10, 'dec': 11
    };
    
    const parts = dateString.toLowerCase().split(' ');
    const month = months[parts[0]];
    const day = parseInt(parts[1].replace(',', ''));
    const year = parseInt(parts[2]);
    
    return new Date(year, month, day);
  };

  // Filter by time period and search query
  const filteredData = useMemo(() => {
    const now = new Date();
    let filtered = [...billingData];
    
    // Apply time filter
    if (timeFilter !== "All Time") {
      filtered = filtered.filter(item => {
        const itemDate = parseDate(item.date);
        
        if (timeFilter === "Last 30 Days") {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(now.getDate() - 30);
          return itemDate >= thirtyDaysAgo;
        } else if (timeFilter === "Last 6 Months") {
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(now.getMonth() - 6);
          return itemDate >= sixMonthsAgo;
        }
        return true;
      });
    }
    
    // Apply search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.invoice_no.toLowerCase().includes(query) ||
        item.date.toLowerCase().includes(query) ||
        item.plan.toLowerCase().includes(query) ||
        item.amount.toLowerCase().includes(query) ||
        item.payment_method.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  }, [billingData, searchQuery, timeFilter]);
  
  return (
    <div className="min-h-screen p-4">
      <div className="mb-6">
        <div className="flex items-center mb-1">
          <span className="text-gray-700 font-medium">Payments</span>
          <span className="mx-2 text-gray-400">›</span>
          <span className="text-gray-700 font-medium">Payments Method</span>
        </div>
        <div className="text-sm text-gray-500">
          Management Payments Method
        </div>
      </div>
      
      <div className="bg-white p-6 rounded shadow-sm">
        <div className="mb-6">
          <div className="text-lg font-medium mb-1">Billing History</div>
          <div className="text-sm text-gray-500">View and download your invoice history</div>
        </div>
        
        <div className="flex justify-between mb-6">
          <div className="relative inline-block">
            <select 
              className="appearance-none border border-gray-300 bg-white text-gray-700 py-2 px-4 pr-8 rounded focus:outline-none"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option>All Time</option>
              <option>Last 30 Days</option>
              <option>Last 6 Months</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="text"
              placeholder="Search Transaction"
              className="border border-gray-300 rounded-md py-2 pl-3 pr-10 focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="text-left text-gray-500 text-sm">
                <th className="pb-4 font-medium">Invoice no</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium">Plan</th>
                <th className="pb-4 font-medium">Amount</th>
                <th className="pb-4 font-medium">Payment Method</th>
                <th className="pb-4 font-medium">Status</th>
                <th className="pb-4 font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item, index) => (
                  <tr key={index} className="border-t border-gray-100">
                    <td className="py-4 text-gray-700">{item.invoice_no}</td>
                    <td className="py-4 text-gray-700">{item.date}</td>
                    <td className="py-4 text-gray-700">{item.plan}</td>
                    <td className="py-4 text-gray-700">{item.amount}</td>
                    <td className="py-4 text-gray-700">Visa...4525</td>
                    <td className="py-4">
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {item.status}
                      </span>
                    </td>
                    <td className="py-4">
                      <button className="text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    No records found matching your search criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}