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
  const [payoutRequests, setPayoutRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePayoutId, setActivePayoutId] = useState<string | null>(null);
  const [payoutForm, setPayoutForm] = useState({
    transactionId: '',
    date: new Date().toISOString().split('T')[0],
    amount: 0
  });

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

      const { data: reqData, error: reqError } = await supabase
        .from('affiliate_payouts')
        .select(`
          *,
          affiliates (
            payment_upi,
            profiles:user_id ( name, phone )
          )
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
        
      if (reqError) {
        console.error('Error fetching payout requests:', reqError);
      } else if (reqData) {
        setPayoutRequests(reqData);
      }
    } catch (error) {
      console.error('Error fetching affiliates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const openPayoutModal = (affiliateId: string, amountToPay: number, requestId?: string) => {
    setActivePayoutId(requestId || affiliateId);
    setPayoutForm({
      transactionId: '',
      date: new Date().toISOString().split('T')[0],
      amount: amountToPay
    });
  };

  const submitPayout = async (affiliateId: string, currentPaid: number, requestId?: string) => {
    if (!payoutForm.transactionId.trim()) {
      alert('Transaction ID is required.');
      return;
    }
    if (payoutForm.amount <= 0) {
      alert('Amount must be greater than 0.');
      return;
    }

    try {
      if (requestId) {
        // Update existing request
        const { error: payoutError } = await supabase
          .from('affiliate_payouts')
          .update({
            amount: payoutForm.amount,
            transaction_id: payoutForm.transactionId.trim(),
            created_at: new Date(payoutForm.date).toISOString(),
            status: 'paid'
          })
          .eq('id', requestId);
        if (payoutError) throw payoutError;
      } else {
        // 1. Record the payout history
        const { error: payoutError } = await supabase
          .from('affiliate_payouts')
          .insert({
            affiliate_id: affiliateId,
            amount: payoutForm.amount,
            transaction_id: payoutForm.transactionId.trim(),
            created_at: new Date(payoutForm.date).toISOString(),
            status: 'paid'
          });

        if (payoutError) throw payoutError;
      }

      // 2. Update total paid on affiliate record
      const newPaidAmount = Number(currentPaid) + Number(payoutForm.amount);
      const { error: updateError } = await supabase
        .from('affiliates')
        .update({ paid_earnings: newPaidAmount })
        .eq('id', affiliateId);

      if (updateError) throw updateError;

      // Update local state
      setAffiliates(affiliates.map(a => 
        a.id === affiliateId 
          ? { ...a, paid_earnings: newPaidAmount }
          : a
      ));
      if (requestId) {
        setPayoutRequests(payoutRequests.filter(r => r.id !== requestId));
      }
      
      setActivePayoutId(null);
      alert('Payout recorded successfully!');
    } catch (error) {
      console.error('Error recording payout:', error);
      alert('Failed to record payout. Please check console for details.');
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

      {/* Pending Payout Requests */}
      {payoutRequests.length > 0 && (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-orange-200">
          <div className="p-4 md:p-6 border-b border-gray-100 flex justify-between items-center bg-orange-50">
            <h3 className="font-bold text-orange-800 flex items-center gap-2">
              <Clock size={20} />
              Pending Withdrawal Requests
            </h3>
            <span className="text-xs font-bold text-orange-700 bg-orange-200 px-3 py-1 rounded-full">
              {payoutRequests.length} Request(s)
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 md:p-6 font-semibold">Affiliate</th>
                  <th className="p-4 md:p-6 font-semibold">Date Requested</th>
                  <th className="p-4 md:p-6 font-semibold text-orange-600">Amount</th>
                  <th className="p-4 md:p-6 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {payoutRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-orange-50/30 transition">
                    <td className="p-4 md:p-6">
                      <div className="font-semibold text-gray-800">{req.affiliates?.profiles?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{req.affiliates?.profiles?.phone || 'No Phone'}</div>
                      {req.affiliates?.payment_upi && (
                        <div className="text-xs font-mono text-purple-600 mt-1 bg-purple-50 inline-block px-2 py-0.5 rounded border border-purple-100">
                          UPI: {req.affiliates.payment_upi}
                        </div>
                      )}
                    </td>
                    <td className="p-4 md:p-6 text-sm text-gray-600">
                      {new Date(req.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 md:p-6 font-bold text-orange-600">
                      ₹{Number(req.amount).toFixed(2)}
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() => openPayoutModal(req.affiliate_id, Number(req.amount), req.id)}
                          className="px-4 py-2 rounded-lg text-sm font-medium transition bg-green-500 text-white hover:bg-green-600 shadow-sm"
                        >
                          Approve & Pay
                        </button>
                        
                        {activePayoutId === req.id && (
                          <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-4 text-left">
                            <h4 className="font-semibold text-gray-800 mb-3 text-sm">Approve Request</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                                <input 
                                  type="number" 
                                  value={payoutForm.amount}
                                  onChange={(e) => setPayoutForm({...payoutForm, amount: Number(e.target.value)})}
                                  className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Payment Date</label>
                                <input 
                                  type="date" 
                                  value={payoutForm.date}
                                  onChange={(e) => setPayoutForm({...payoutForm, date: e.target.value})}
                                  className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID / UPI Ref</label>
                                <input 
                                  type="text" 
                                  value={payoutForm.transactionId}
                                  onChange={(e) => setPayoutForm({...payoutForm, transactionId: e.target.value})}
                                  className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                  placeholder="e.g. 123456789"
                                />
                              </div>
                              <div className="flex gap-2 pt-2">
                                <button 
                                  onClick={() => setActivePayoutId(null)}
                                  className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm font-medium transition"
                                >
                                  Cancel
                                </button>
                                <button 
                                  onClick={() => submitPayout(req.affiliate_id, req.affiliates?.paid_earnings || 0, req.id)}
                                  className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition"
                                >
                                  Submit
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
                          <div className="relative inline-block text-left">
                            <button
                              onClick={() => openPayoutModal(affiliate.id, unpaid)}
                              disabled={!canWithdraw}
                              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                                canWithdraw 
                                  ? 'bg-green-500 text-white hover:bg-green-600 shadow-sm' 
                                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              }`}
                              title={!canWithdraw ? `Minimum payout is ₹${minPayout}` : `Pay ₹${unpaid.toFixed(2)}`}
                            >
                              Record Payout
                            </button>
                            
                            {activePayoutId === affiliate.id && (
                              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-10 p-4 text-left">
                                <h4 className="font-semibold text-gray-800 mb-3 text-sm">Payout Details</h4>
                                <div className="space-y-3">
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Amount (₹)</label>
                                    <input 
                                      type="number" 
                                      value={payoutForm.amount}
                                      onChange={(e) => setPayoutForm({...payoutForm, amount: Number(e.target.value)})}
                                      className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                                    <input 
                                      type="date" 
                                      value={payoutForm.date}
                                      onChange={(e) => setPayoutForm({...payoutForm, date: e.target.value})}
                                      className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                    />
                                  </div>
                                  <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Transaction ID / UPI Ref</label>
                                    <input 
                                      type="text" 
                                      value={payoutForm.transactionId}
                                      onChange={(e) => setPayoutForm({...payoutForm, transactionId: e.target.value})}
                                      className="w-full text-sm px-3 py-1.5 border border-gray-300 rounded focus:ring-1 focus:ring-green-500"
                                      placeholder="e.g. 123456789"
                                    />
                                  </div>
                                  <div className="flex gap-2 pt-2">
                                    <button 
                                      onClick={() => setActivePayoutId(null)}
                                      className="flex-1 px-3 py-1.5 bg-gray-100 text-gray-600 rounded hover:bg-gray-200 text-sm font-medium transition"
                                    >
                                      Cancel
                                    </button>
                                    <button 
                                      onClick={() => submitPayout(affiliate.id, paid)}
                                      className="flex-1 px-3 py-1.5 bg-green-600 text-white rounded hover:bg-green-700 text-sm font-medium transition"
                                    >
                                      Submit
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
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
