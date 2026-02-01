import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Phone, Mail, DollarSign, Package } from 'lucide-react';

export function RefundPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">REFUND & RETURN POLICY</h1>
                <h2 className="text-xl text-green-600 font-semibold mb-6">Vaddadi Pickles</h2>
                <p className="text-gray-500 mb-8 border-b pb-6">Last updated: 01 Feb 2026</p>

                <div className="prose prose-green max-w-none space-y-8 text-gray-700">
                    <p className="text-lg">
                        At Vaddadi Pickles, customer satisfaction is important to us. However, due to the nature of food products,
                        we follow a strict but fair refund policy.
                    </p>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <XCircle className="text-red-500" /> 1. No Returns on Food Products
                        </h3>
                        <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-3">
                            <span className="text-xl">❌</span>
                            <p className="font-medium text-red-800">
                                We do not accept returns on pickles or food items once delivered, for hygiene and safety reasons.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-600" /> 2. Refund Eligibility
                        </h3>
                        <p className="mb-2">Refunds will be considered only in the following cases:</p>
                        <ul className="list-disc list-inside space-y-2 ml-4">
                            <li>Damaged product received</li>
                            <li>Wrong product delivered</li>
                            <li>Missing items in the order</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-yellow-500" /> 3. Conditions for Refund
                        </h3>
                        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                            <ul className="list-disc list-inside space-y-2 text-yellow-900 font-medium">
                                <li>You must contact us within 24 hours of delivery</li>
                                <li>Provide clear photos or videos of the issue</li>
                                <li>Product should be unused and in original packaging</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <DollarSign className="text-green-600" /> 4. Payment Verification Issues
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>If a UPI payment cannot be verified, the order will be cancelled</li>
                            <li>In case of successful payment but failed verification, refund will be processed after confirmation</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <RefreshCw className="text-green-600" /> 5. Refund Process
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Approved refunds will be processed within 5–7 working days</li>
                            <li>Refunds will be credited back to the original payment method (UPI/bank)</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <XCircle className="text-gray-600" /> 6. No Refunds for:
                        </h3>
                        <div className="grid md:grid-cols-2 gap-4">
                            {['Taste preferences', 'Delayed delivery by courier', 'Incorrect address provided by the customer', 'Orders placed incorrectly by the customer'].map((item) => (
                                <div key={item} className="bg-gray-50 p-3 rounded flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full"></div>
                                    <span>{item}</span>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Package className="text-green-600" /> 7. Cash on Delivery (COD)
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>No refunds for refused COD orders</li>
                            <li>Repeated COD refusals may result in account restriction</li>
                        </ul>
                    </section>

                    <section className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">8. Contact for Refunds</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <Phone className="text-green-600" size={20} />
                                <span className="font-medium text-gray-800">8008129309</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Mail className="text-green-600" size={20} />
                                <span className="font-medium text-gray-800">vvrsadithya@gmail.com</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
