import React, { useEffect, useState } from 'react';
import { apiService, API_URL } from '../utils/api';
import { FiSearch, FiDownload, FiFileText } from 'react-icons/fi';
import { FaFileAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

const API_BASE = `${API_URL}/api/reports`;

export const ReportsAndAnalytics = () => {
  const [inventory, setInventory] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchInventory();
    fetchValuation();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const res = await apiService.get(`${API_BASE}/inventory-list`);
      // Only include products that are not expired (expireDate is in the future or not set)
      const now = new Date();
      const filtered = res.data.filter(item => {
        if (!item.expireDate) return true;
        return new Date(item.expireDate) >= now;
      });
      setInventory(filtered);
      setError(null);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      setError('Failed to fetch inventory list.');
    }
    setLoading(false);
  };


  const fetchValuation = async () => {
    try {
      const res = await apiService.get(`${API_BASE}/inventory-valuation`);
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch valuation:', error);
      setStats({});
    }
  };

  const handleExportCSV = async () => {
    try {
      const res = await apiService.get(`${API_BASE}/export-csv`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('CSV file downloaded!');
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV.');
    }
  };

  const handleExportPDF = async () => {
    try {
      const res = await apiService.get(`${API_BASE}/export-pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF file downloaded!');
    } catch (error) {
      console.error('Failed to export PDF:', error);
      toast.error('Failed to export PDF.');
    }
  };


  const handleExportExcel = async () => {
    try {
      const res = await apiService.get(`${API_BASE}/export-excel`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'inventory.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Excel file downloaded!');
    } catch (error) {
      console.error('Failed to export Excel:', error);
      toast.error('Failed to export Excel.');
    }
  };

  const filteredInventory = inventory.filter(listing => {
    const searchLower = searchTerm.toLowerCase();
    return (
      listing.wasteItem.toLowerCase().includes(searchLower) ||
      listing.wasteType.toLowerCase().includes(searchLower) ||
      listing.wasteCategory.toLowerCase().includes(searchLower) ||
      listing.city.toLowerCase().includes(searchLower) ||
      listing.district.toLowerCase().includes(searchLower) ||
      listing.province.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="p-6 bg-gradient-to-br from-green-50 to-blue-50 min-h-screen">
      <h2 className="text-3xl font-extrabold mb-6 text-green-900 tracking-tight flex items-center">
        <FiFileText className="mr-2 text-green-700" size={32} /> Inventory Reports & Analytics
      </h2>
      {/* Stats Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border-t-4 border-green-400">
          <span className="text-lg font-semibold text-gray-700">Total Inventory Value</span>
          <span className="text-2xl font-bold text-green-700 mt-2">Rs.{stats.totalValue?.toLocaleString() || 0}</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border-t-4 border-green-400">
          <span className="text-lg font-semibold text-gray-700">Total Items</span>
          <span className="text-2xl font-bold text-blue-700 mt-2">{stats.totalItems || 0}</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col items-center border-t-4 border-green-400">
          <span className="text-lg font-semibold text-gray-700">Total Quantity</span>
          <span className="text-2xl font-bold text-yellow-600 mt-2">{stats.totalQuantity || 0}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col border-t-4 border-blue-400">
          <span className="text-lg font-semibold text-gray-700">Average Price per Item</span>
          <span className="text-xl font-bold text-purple-700 mt-2">Rs.{stats.avgPrice?.toFixed(2) || 0}</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col border-t-4 border-blue-400">
          <span className="text-lg font-semibold text-gray-700">Most Valuable Item</span>
          <span className="text-base text-pink-700 mt-2 font-bold">{stats.mostValuable ? `${stats.mostValuable.wasteItem} (${stats.mostValuable.quantity}) ` : '-'}</span>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col border-t-4 border-red-400 col-span-1 md:col-span-2">
          <span className="text-lg font-semibold text-gray-700">Soonest to Expire</span>
          <span className="text-base text-red-700 mt-2 font-bold">{stats.soonestToExpire ? `${stats.soonestToExpire.wasteItem} (${new Date(stats.soonestToExpire.expireDate).toLocaleDateString()})` : '-'}</span>
        </div>
      </div>
      {/* Controls */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="flex items-center border-2 border-green-200 rounded-lg px-3 py-1 bg-white shadow-sm">
          <FiSearch className="text-green-400 mr-2" />
          <input
            type="text"
            placeholder="Search inventory..."
            className="outline-none py-1 bg-transparent"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <button
          className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 shadow-md transition-all"
          onClick={handleExportExcel}
        >
          <FiDownload className="mr-2" /> Excel
        </button>
        <button
          className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 shadow-md transition-all"
          onClick={handleExportCSV}
        >
          <FiFileText className="mr-2" /> CSV
        </button>
        <button
          className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 shadow-md transition-all"
          onClick={handleExportPDF}
        >
          <FaFileAlt className="mr-2" /> PDF
        </button>
      </div>
      {/* Table */}
      {loading ? (
        <div className="flex justify-center items-center h-40">Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-2xl shadow-lg border border-green-100">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-green-100 sticky top-0 z-10">
              <tr>
                <th className="py-3 px-4 font-semibold text-green-800">Waste Category</th>
                <th className="py-3 px-4 font-semibold text-green-800">Waste Type</th>
                <th className="py-3 px-4 font-semibold text-green-800">Waste Item</th>
                <th className="py-3 px-4 font-semibold text-green-800">Province</th>
                <th className="py-3 px-4 font-semibold text-green-800">District</th>
                <th className="py-3 px-4 font-semibold text-green-800">City</th>
                <th className="py-3 px-4 font-semibold text-green-800">Quantity</th>
                <th className="py-3 px-4 font-semibold text-green-800">Price</th>
                <th className="py-3 px-4 font-semibold text-green-800">Expire Date</th>
                <th className="py-3 px-4 font-semibold text-green-800">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length === 0 ? (
                <tr><td colSpan={10} className="text-center py-4">No records found.</td></tr>
              ) : (
                filteredInventory.map((listing, idx) => (
                  <tr key={listing._id || idx} className={idx % 2 === 0 ? 'bg-green-50' : 'bg-white hover:bg-green-100 transition'}>
                    <td className="py-2 px-4">{listing.wasteCategory}</td>
                    <td className="py-2 px-4">{listing.wasteType}</td>
                    <td className="py-2 px-4 font-bold text-green-700">{listing.wasteItem}</td>
                    <td className="py-2 px-4">{listing.province}</td>
                    <td className="py-2 px-4">{listing.district}</td>
                    <td className="py-2 px-4">{listing.city}</td>
                    <td className="py-2 px-4">{listing.quantity}</td>
                    <td className="py-2 px-4">${listing.price}</td>
                    <td className="py-2 px-4">
                      {listing.expireDate ? (
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${new Date(listing.expireDate) < new Date() ? 'bg-red-200 text-red-700' : 'bg-yellow-100 text-yellow-800'}`} title={listing.expireDate}>
                          {new Date(listing.expireDate).toLocaleDateString()}
                        </span>
                      ) : ''}
                    </td>
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${listing.status === 'Active' ? 'bg-green-200 text-green-800' : 'bg-gray-200 text-gray-600'}`}>{listing.status}</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
