import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { Navigate } from 'react-router-dom';
import { Copy, TrendingUp, DollarSign, Users, CheckCircle2, ShoppingBag, CreditCard, Save } from 'lucide-react';
import { Affiliate, AffiliateSale } from '../types';
import { SITE_URL } from '../utils/constants';
import toast from 'react-hot-toast';

export function AffiliateDashboard() {
  const { user } = useStore();
  
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [upiId, setUpiId] = useState('');
  const [isSavingUpi, setIsSavingUpi] = useState(false);
  const [upiMessage, setUpiMessage] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [withdrawAmountInput, setWithdrawAmountInput] = useState<string>('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchAffiliateData() {
      try {
        setIsLoading(true);
        // Fetch affiliate profile
        let { data: affiliateData, error: affiliateError } = await supabase
          .from('affiliates')
          .select('*')
          .eq('user_id', user!.id)
          .single();

        // Auto-create affiliate if doesn't exist
        if (!affiliateData || affiliateError?.code === 'PGRST116') {
          const autoCode = 'VP-' + user!.id.split('-')[0].toUpperCase();
          const { data: newAffiliate, error: insertError } = await supabase
            .from('affiliates')
            .insert({
              user_id: user!.id,
              referral_code: autoCode,
              commission_rate: 10.00
            })
            .select()
            .single();
          
          if (!insertError && newAffiliate) {
             affiliateData = newAffiliate;
          }
        }

        if (affiliateData) {
          setAffiliate({
            id: affiliateData.id,
            userId: affiliateData.user_id,
            referralCode: affiliateData.referral_code,
            commissionRate: affiliateData.commission_rate,
            totalEarnings: affiliateData.total_earnings,
            paidEarnings: affiliateData.paid_earnings,
            paymentUpi: affiliateData.payment_upi,
            status: affiliateData.status,
            createdAt: affiliateData.created_at
          });
          
          if (affiliateData.payment_upi) {
            setUpiId(affiliateData.payment_upi);
          }

          // Fetch recent sales
          const { data: salesData, error: salesError } = await supabase
            .from('affiliate_sales')
            .select('*')
            .eq('affiliate_id', affiliateData.id)
            .order('created_at', { ascending: false });

          if (!salesError && salesData) {
            setSales(salesData.map(sale => ({
              id: sale.id,
              affiliateId: sale.affiliate_id,
              orderId: sale.order_id,
              orderAmount: sale.order_amount,
              commissionEarned: sale.commission_earned,
              status: sale.status,
              createdAt: sale.created_at
            })));
          }

          // Fetch payouts
          const { data: payoutData, error: payoutError } = await supabase
            .from('affiliate_payouts')
            .select('*')
            .eq('affiliate_id', affiliateData.id)
            .order('created_at', { ascending: false });

          if (!payoutError && payoutData) {
            setPayouts(payoutData);
          }
        }
      } catch (err) {
        console.error('Unexpected error fetching affiliate data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAffiliateData();
  }, [user]);

  const handleSaveUpi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!affiliate) return;
    
    setIsSavingUpi(true);
    setUpiMessage('');

    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ payment_upi: upiId })
        .eq('id', affiliate.id);

      if (error) throw error;

      setAffiliate({ ...affiliate, paymentUpi: upiId });
      setUpiMessage('UPI ID saved successfully!');
      setTimeout(() => setUpiMessage(''), 3000);
    } catch (err) {
      setUpiMessage('Error saving UPI ID.');
    } finally {
      setIsSavingUpi(false);
    }
  };

  const copyToClipboard = () => {
    if (!affiliate) return;
    const link = `${SITE_URL}/?ref=${affiliate.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleWithdrawRequest = async () => {
    if (!affiliate) return;
    if (!affiliate.paymentUpi) {
      toast.error("Please save your UPI ID below before requesting a withdrawal.");
      return;
    }
    
    const availableToWithdraw = affiliate.totalEarnings - affiliate.paidEarnings - payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
    const amountToWithdraw = Number(withdrawAmountInput) || availableToWithdraw;
    
    if (amountToWithdraw < 500) {
      toast.error("Minimum ₹500 is required to request a withdrawal.");
      return;
    }

    if (amountToWithdraw > availableToWithdraw) {
      toast.error(`You can only withdraw up to ₹${availableToWithdraw}`);
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('affiliate_payouts')
        .insert({
          affiliate_id: affiliate.id,
          amount: amountToWithdraw,
          status: 'pending'
        });

      if (error) throw error;
      
      toast.success("Withdrawal request submitted successfully! It will be processed soon.");
      
      // Refresh payouts
      const { data: payoutData } = await supabase
        .from('affiliate_payouts')
        .select('*')
        .eq('affiliate_id', affiliate.id)
        .order('created_at', { ascending: false });
        
      if (payoutData) setPayouts(payoutData);
      
    } catch (err) {
      console.error("Error requesting withdrawal:", err);
      toast.error("Failed to submit withdrawal request.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!affiliate) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <p className="text-red-500">Error loading affiliate dashboard. Please contact support.</p>
      </div>
    );
  }

  const pendingAmount = affiliate.totalEarnings - affiliate.paidEarnings;
  const requestedAmount = payouts.filter(p => p.status === 'pending').reduce((sum, p) => sum + Number(p.amount), 0);
  const availableToWithdraw = pendingAmount - requestedAmount;
  
  const hasPendingRequest = requestedAmount > 0;
  
  let daysSinceLastRequest = 8;
  if (payouts.length > 0) {
    const lastRequestDate = new Date(payouts[0].created_at).getTime();
    daysSinceLastRequest = (new Date().getTime() - lastRequestDate) / (1000 * 3600 * 24);
  }
  
  const canWithdraw = availableToWithdraw >= 500 && daysSinceLastRequest >= 7 && !hasPendingRequest;
  const totalOrders = sales.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
        <p className="mt-2 text-gray-600">Partner with us and earn {affiliate.commissionRate}% on every sale.</p>
      </div>

      <div className="space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Orders</p>
              <p className="text-2xl font-bold text-gray-900">{totalOrders}</p>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Earned</p>
              <p className="text-2xl font-bold text-gray-900">₹{affiliate.totalEarnings}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Withdrawn Amount</p>
              <p className="text-2xl font-bold text-gray-900">₹{affiliate.paidEarnings}</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-center">
            <div className="flex items-center mb-3">
              <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Available to Withdraw</p>
                <p className="text-2xl font-bold text-gray-900">₹{availableToWithdraw}</p>
              </div>
            </div>
            
            <div className="mb-3">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input 
                  type="number"
                  value={withdrawAmountInput || ''}
                  onChange={(e) => setWithdrawAmountInput(e.target.value)}
                  placeholder={availableToWithdraw.toString()}
                  disabled={!canWithdraw || hasPendingRequest}
                  className="w-full pl-8 pr-16 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none disabled:bg-gray-50"
                  max={availableToWithdraw}
                  min={500}
                />
                <button
                  onClick={() => setWithdrawAmountInput(availableToWithdraw.toString())}
                  disabled={!canWithdraw || hasPendingRequest}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded font-medium transition disabled:opacity-50"
                >
                  MAX
                </button>
              </div>
            </div>
            
            <button
              onClick={handleWithdrawRequest}
              disabled={!canWithdraw || (Number(withdrawAmountInput) || availableToWithdraw) > availableToWithdraw}
              className={`w-full py-2 rounded-lg text-sm font-medium transition ${
                canWithdraw && (Number(withdrawAmountInput) || availableToWithdraw) <= availableToWithdraw
                  ? 'bg-orange-500 text-white hover:bg-orange-600' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {hasPendingRequest ? 'Withdrawal Pending' : 'Request Withdrawal'}
            </button>
            
            <p className="text-[10px] text-gray-500 mt-2 text-center">
              {!affiliate.paymentUpi ? "⚠️ Add UPI below first." : 
               hasPendingRequest ? "You already have a pending request." :
               daysSinceLastRequest < 7 ? `Next withdrawal in ${Math.ceil(7 - daysSinceLastRequest)} days.` :
               "Min. ₹500. Payouts processed within 1-2 days."}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Share Link & UPI Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Share Link Section */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h2>
              <p className="text-sm text-gray-600 mb-4">
                Share this link to earn a {affiliate.commissionRate}% commission on sales!
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 break-all text-sm font-mono">
                  {`${SITE_URL}/?ref=${affiliate.referralCode}`}
                </div>
                <button
                  onClick={copyToClipboard}
                  className="flex-shrink-0 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  {copySuccess ? (
                    <><CheckCircle2 className="w-5 h-5" /> Copied!</>
                  ) : (
                    <><Copy className="w-5 h-5" /> Copy Link</>
                  )}
                </button>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Referrals</h2>
              
              {sales.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <Users className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No referrals yet. Share your link to start earning!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commission</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {sales.slice(0, 10).map((sale) => (
                        <tr key={sale.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(sale.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {sale.orderId.slice(0, 8)}...
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            ₹{sale.orderAmount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            ₹{sale.commissionEarned}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              sale.status === 'approved' ? 'bg-green-100 text-green-800' :
                              sale.status === 'paid' ? 'bg-purple-100 text-purple-800' :
                              sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Payout History */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payout History</h2>
              
              {payouts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
                    <CheckCircle2 className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500">No payouts yet. Earn at least ₹500 to get paid!</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction ID</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payouts.map((payout) => (
                        <tr key={payout.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(payout.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            ₹{payout.amount}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {payout.status === 'pending' ? (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </span>
                            ) : (
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Paid
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-purple-600">
                            {payout.transaction_id || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* UPI Form Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 sticky top-24">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900">Payout Details</h2>
              </div>
              <p className="text-sm text-gray-600 mb-6">
                Enter your UPI ID where you want to receive your affiliate commissions. Minimum payout is ₹500.
              </p>
              <form onSubmit={handleSaveUpi} className="space-y-4">
                <div>
                  <label htmlFor="upiId" className="block text-sm font-medium text-gray-700 mb-1">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    id="upiId"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="e.g. yourname@okicici"
                  />
                </div>
                
                {upiMessage && (
                  <p className={`text-sm ${upiMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                    {upiMessage}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isSavingUpi || upiId.trim() === affiliate.paymentUpi}
                  className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="w-4 h-4" />
                  {isSavingUpi ? 'Saving...' : 'Save UPI ID'}
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
