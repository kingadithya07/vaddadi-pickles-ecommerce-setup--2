import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { CheckCircle, Clock, IndianRupee, Network, Users } from 'lucide-react';

interface AffiliateAdminData {
  id: string;
  user_id: string;
  referral_code: string;
  commission_rate: number;
  total_earnings: number;
  paid_earnings: number;
  payment_upi?: string;
  status: string;
  created_at: string;
  profiles: {
    name: string;
    phone: string;
  };
}

export function AdminAffiliates() {
  const [affiliates, setAffiliates] = useState<AffiliateAdminData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select(`
          *,
          profiles:user_id (name, phone)
        `);

      if (error) throw error;
      setAffiliates(data || []);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayout = async (affiliateId: string, amountToPay: number, currentPaid: number) => {
    if (!window.confirm(`Are you sure you want to mark ₹${amountToPay} as paid?`)) return;

    try {
      const newPaidAmount = Number(currentPaid) + Number(amountToPay);
      const { error } = await supabase
        .from('affiliates')
        .update({ paid_earnings: newPaidAmount })
        .eq('id', affiliateId);

      if (error) throw error;

      // Update local state
      setAffiliates(affiliates.map(a => 
        a.id === affiliateId 
          ? { ...a, paid_earnings: newPaidAmount }
          : a
      ));
      
      alert('Payout recorded successfully!');
    } catch (error) {
      console.error('Error recording payout:', error);
      alert('Failed to record payout.');
    }
  };

  const totalAffiliates = affiliates.length;
  const totalCommissionGenerated = affiliates.reduce((sum, a) => sum + Number(a.total_earnings), 0);
  const totalPaid = affiliates.reduce((sum, a) => sum + Number(a.paid_earnings), 0);
  const totalUnpaid = totalCommissionGenerated - totalPaid;

  const minPayout = 500; // Minimum ₹500 payout threshold

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500 font-medium">Loading Affiliates Data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Network className="text-purple-600" size={28} />
        <h2 className="text-xl md:text-2xl font-bold text-gray-800">Affiliate Management</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Users className="text-blue-500" size={24} />
            <span className="text-xl md:text-2xl font-bold text-gray-800">{totalAffiliates}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Affiliates</p>
        </div>
        
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <IndianRupee className="text-green-500" size={24} />
            <span className="text-xl md:text-2xl font-bold text-gray-800">₹{totalCommissionGenerated.toFixed(0)}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Generated</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="text-teal-500" size={24} />
            <span className="text-xl md:text-2xl font-bold text-gray-800">₹{totalPaid.toFixed(0)}</span>
          </div>
          <p className="text-gray-600 text-sm">Total Paid Out</p>
        </div>

        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          <div className="flex items-center justify-between mb-2">
            <Clock className="text-orange-500" size={24} />
            <span className="text-xl md:text-2xl font-bold text-gray-800">₹{totalUnpaid.toFixed(0)}</span>
          </div>
          <p className="text-gray-600 text-sm">Pending Payouts</p>
        </div>
      </div>

      {/* Affiliates List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800">Affiliate Accounts</h3>
          <span className="text-xs font-medium text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
            Min. Payout: ₹{minPayout}
          </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-white border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                <th className="p-4 md:p-6 font-semibold">Affiliate</th>
                <th className="p-4 md:p-6 font-semibold">Code / Rate</th>
                <th className="p-4 md:p-6 font-semibold">Generated</th>
                <th className="p-4 md:p-6 font-semibold text-orange-600">Unpaid</th>
                <th className="p-4 md:p-6 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {affiliates.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No affiliates found.
                  </td>
                </tr>
              ) : (
                affiliates.map((affiliate) => {
                  const generated = Number(affiliate.total_earnings);
                  const paid = Number(affiliate.paid_earnings);
                  const unpaid = generated - paid;
                  const canWithdraw = unpaid >= minPayout;

                  return (
                    <tr key={affiliate.id} className="hover:bg-gray-50/50 transition">
                      <td className="p-4 md:p-6">
                        <div className="font-semibold text-gray-800">{affiliate.profiles?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{affiliate.profiles?.phone || 'No Phone'}</div>
                        {affiliate.payment_upi && (
                          <div className="text-xs font-mono text-purple-600 mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded border border-purple-100">
                            UPI: {affiliate.payment_upi}
                          </div>
                        )}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="inline-flex items-center px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 font-mono text-sm mb-1">
                          {affiliate.referral_code}
                        </div>
                        <div className="text-sm text-gray-500">{affiliate.commission_rate}% Commission</div>
                      </td>
                      <td className="p-4 md:p-6 font-medium text-gray-800">
                        ₹{generated.toFixed(2)}
                      </td>
                      <td className="p-4 md:p-6">
                        <div className="font-bold text-orange-600">₹{unpaid.toFixed(2)}</div>
                        <div className="text-xs text-green-600 mt-1">Paid: ₹{paid.toFixed(2)}</div>
                      </td>
                      <td className="p-4 md:p-6 text-right">
                        {unpaid > 0 ? (
                          <button
                            onClick={() => handlePayout(affiliate.id, unpaid, paid)}
                            disabled={!canWithdraw}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                              canWithdraw 
                                ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                            title={!canWithdraw ? `Minimum payout is ₹${minPayout}` : `Pay ₹${unpaid.toFixed(2)}`}
                          >
                            Mark as Paid
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg">
                            <CheckCircle size={16} /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
