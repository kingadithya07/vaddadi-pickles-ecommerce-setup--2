import { ShoppingBag, DollarSign, Truck, AlertTriangle, UserCheck, ShieldAlert, Phone, Mail, CheckCircle, Info } from 'lucide-react';

export function TermsAndConditions() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">TERMS & CONDITIONS</h1>
                <h2 className="text-xl text-green-600 font-semibold mb-6">Vaddadi Pickles</h2>
                <p className="text-gray-500 mb-8 border-b pb-6">Last updated: 01 Feb 2026</p>

                <div className="prose prose-green max-w-none space-y-8 text-gray-700">
                    <p className="text-lg">
                        Welcome to Vaddadi Pickles. By accessing or purchasing from our website, you agree to the following Terms & Conditions.
                        Please read them carefully.
                    </p>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Info className="text-green-600" /> 1. About Us
                        </h3>
                        <p>Vaddadi Pickles is a food business specializing in homemade pickles and related products, sold directly to customers through our website and other digital platforms.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <ShoppingBag className="text-green-600" /> 2. Products & Availability
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>All products are prepared with care using traditional methods.</li>
                            <li>Product images are for representation only; actual appearance may slightly vary.</li>
                            <li>Availability of products is subject to stock.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <DollarSign className="text-green-600" /> 3. Pricing
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>All prices are mentioned in Indian Rupees (INR).</li>
                            <li>Prices may change without prior notice.</li>
                            <li>The price shown at checkout is the final price (excluding delivery charges if applicable).</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-600" /> 4. Payments
                        </h3>
                        <p className="mb-2">We accept payments through:</p>
                        <ul className="list-disc list-inside space-y-1 mb-4">
                            <li>UPI (Google Pay, PhonePe, Paytm, etc.)</li>
                            <li>Direct bank transfer</li>
                            <li>Cash on Delivery (if available)</li>
                        </ul>
                        <div className="bg-yellow-50 p-3 rounded border border-yellow-200 flex items-start gap-2 text-sm text-yellow-800">
                            <span className="text-lg">⚠️</span>
                            <p>Orders will be confirmed only after payment verification in case of prepaid orders.</p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <CheckCircle className="text-green-600" /> 5. Order Confirmation
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>After placing an order, you will receive a confirmation via WhatsApp/SMS.</li>
                            <li>For UPI/manual payments, order status will remain “Pending” until verified.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Truck className="text-green-600" /> 6. Shipping & Delivery
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>We ship orders within India.</li>
                            <li>Delivery timelines may vary based on location and courier availability.</li>
                            <li>Delays caused by courier services, weather, or unforeseen circumstances are beyond our control.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <AlertTriangle className="text-red-500" /> 7. Cancellations
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Orders cannot be cancelled once shipped.</li>
                            <li>If you wish to cancel, please contact us immediately after placing the order.</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <UserCheck className="text-green-600" /> 8. User Responsibilities
                        </h3>
                        <p className="mb-2">You agree:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>To provide accurate contact and delivery information</li>
                            <li>Not to misuse the website</li>
                            <li>Not to attempt fraudulent payments or false claims</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <ShieldAlert className="text-gray-600" /> 9. Limitation of Liability
                        </h3>
                        <p className="mb-2">Vaddadi Pickles shall not be liable for:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Delays in delivery</li>
                            <li>Minor variations in product taste or appearance</li>
                            <li>Issues arising from incorrect delivery details provided by the customer</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">10. Changes to Terms</h3>
                        <p>We reserve the right to update these Terms & Conditions at any time without prior notice.</p>
                    </section>

                    <section className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">11. Contact Us</h3>
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
