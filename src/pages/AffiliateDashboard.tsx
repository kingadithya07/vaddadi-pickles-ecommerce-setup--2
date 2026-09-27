import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { supabase } from '../lib/supabase';
import { Link, Navigate } from 'react-router-dom';
import { Copy, TrendingUp, DollarSign, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Affiliate, AffiliateSale } from '../types';

export function AffiliateDashboard() {
  const { user } = useStore();
  
  const [affiliate, setAffiliate] = useState<Affiliate | null>(null);
  const [sales, setSales] = useState<AffiliateSale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Registration form state
  const [upiId, setUpiId] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    async function fetchAffiliateData() {
      try {
        setIsLoading(true);
        // Fetch affiliate profile
        const { data: affiliateData, error: affiliateError } = await supabase
          .from('affiliates')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (affiliateError && affiliateError.code !== 'PGRST116') {
          console.error('Error fetching affiliate:', affiliateError);
        }

        if (affiliateData) {
          // Map DB snake_case to camelCase Affiliate type
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

          // Fetch recent sales
          const { data: salesData, error: salesError } = await supabase
            .from('affiliate_sales')
            .select('*')
            .eq('affiliate_id', affiliateData.id)
            .order('created_at', { ascending: false })
            .limit(10);

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
        }
      } catch (err) {
        console.error('Unexpected error fetching affiliate data:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAffiliateData();
  }, [user]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    const upi = upiId.trim();
    if (!upi) {
      setError('Please enter a valid UPI ID for payments.');
      return;
    }

    setIsRegistering(true);
    setError('');

    const autoCode = 'VP-' + user.id.split('-')[0].toUpperCase();

    try {
      const { data, error: insertError } = await supabase
        .from('affiliates')
        .insert({
          user_id: user.id,
          referral_code: autoCode,
          commission_rate: 10.00, // Default 10%
          payment_upi: upi
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') { // Unique violation
          setError('This referral code is already taken. Please choose another.');
        } else {
          setError('Error registering for affiliate program. Try again later.');
        }
      } else if (data) {
        setAffiliate({
          id: data.id,
          userId: data.user_id,
          referralCode: data.referral_code,
          commissionRate: data.commission_rate,
          totalEarnings: data.total_earnings,
          paidEarnings: data.paid_earnings,
          paymentUpi: data.payment_upi,
          status: data.status,
          createdAt: data.created_at
        });
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsRegistering(false);
    }
  };

  const copyToClipboard = () => {
    if (!affiliate) return;
    const link = `https://vaddadi-pickles.onrender.com/?ref=${affiliate.referralCode}`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Affiliate Dashboard</h1>
        <p className="mt-2 text-gray-600">Partner with us and earn money by referring customers.</p>
      </div>

      {!affiliate ? (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden max-w-2xl mx-auto">
          <div className="p-8">
            <div className="text-center mb-8">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join the Vaddadi Pickles Affiliate Program!</h2>
              <p className="mt-2 text-gray-600">Earn a 10% commission on every sale made through your unique referral link.</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-6">
              <div>
                <label htmlFor="upiId" className="block text-sm font-medium text-gray-700">UPI ID for Payouts</label>
                <div className="mt-2 flex rounded-md shadow-sm">
                  <input
                    type="text"
                    id="upiId"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-green-500 focus:border-green-500 sm:text-sm"
                    placeholder="e.g. 9876543210@ybl"
                  />
                </div>
                {error && (
                  <p className="mt-2 text-sm text-red-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {error}
                  </p>
                )}
                <p className="mt-2 text-xs text-gray-500">Your referral code will be automatically generated upon signup.</p>
              </div>

              <button
                type="submit"
                disabled={isRegistering || !upiId}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors"
              >
                {isRegistering ? 'Registering...' : 'Join Now'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Commission Rate</p>
                <p className="text-2xl font-bold text-gray-900">{affiliate.commissionRate}%</p>
              </div>
            </div>
            
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{affiliate.totalEarnings}</p>
                <p className="text-[10px] text-gray-500 mt-1">Min. withdraw request: ₹500</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center">
              <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Paid Earnings</p>
                <p className="text-2xl font-bold text-gray-900">₹{affiliate.paidEarnings}</p>
                {affiliate.paymentUpi && (
                  <p className="text-[10px] text-gray-500 mt-1 font-mono">UPI: {affiliate.paymentUpi}</p>
                )}
              </div>
            </div>
          </div>

          {/* Share Link Section */}
          <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Referral Link</h2>
            <p className="text-sm text-gray-600 mb-4">
              Share this link with your friends, family, or followers. When they click the link and make a purchase, you will earn a {affiliate.commissionRate}% commission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex items-center bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 break-all text-sm sm:text-base">
                {`https://vaddadi-pickles.onrender.com/?ref=${affiliate.referralCode}`}
              </div>
              <button
                onClick={copyToClipboard}
                className="flex-shrink-0 flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                {copySuccess ? (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-5 h-5" />
                    Copy Link
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Referrals</h2>
            </div>
            
            {sales.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto text-gray-300 mb-3" />
                <p>No referrals yet. Share your link to start earning!</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-gray-500 text-sm border-b border-gray-100">
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Order Amount</th>
                      <th className="p-4 font-medium">Commission</th>
                      <th className="p-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale) => (
                      <tr key={sale.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-sm text-gray-900">
                          {new Date(sale.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-4 text-sm text-gray-900">₹{sale.orderAmount}</td>
                        <td className="p-4 text-sm font-medium text-green-600">+₹{sale.commissionEarned}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                            ${sale.status === 'paid' ? 'bg-green-100 text-green-800' : 
                              sale.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                              sale.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'}`}>
                            {sale.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
