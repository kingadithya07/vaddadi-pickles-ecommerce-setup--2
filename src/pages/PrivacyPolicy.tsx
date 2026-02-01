import { Shield, Lock, Eye, Share2, Cookie, UserCheck, RefreshCw, Phone, Mail } from 'lucide-react';

export function PrivacyPolicy() {
    return (
        <div className="max-w-4xl mx-auto px-4 py-12">
            <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
                <h1 className="text-3xl md:text-4xl font-bold text-green-800 mb-2">PRIVACY POLICY</h1>
                <h2 className="text-xl text-green-600 font-semibold mb-6">Vaddadi Pickles</h2>
                <p className="text-gray-500 mb-8 border-b pb-6">Last updated: 01 Feb 2026</p>

                <div className="prose prose-green max-w-none space-y-8 text-gray-700">
                    <p className="text-lg">
                        Vaddadi Pickles values your privacy and is committed to protecting your personal information.
                        This Privacy Policy explains how we collect, use, and safeguard your data when you visit or make a purchase from our website.
                    </p>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Eye className="text-green-600" /> 1. Information We Collect
                        </h3>
                        <p className="mb-4">We may collect the following information:</p>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">a) Personal Information</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Name</li>
                                    <li>Phone number</li>
                                    <li>Email address</li>
                                    <li>Delivery address</li>
                                    <li>Payment reference details (such as UTR number)</li>
                                </ul>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-semibold text-gray-900 mb-2">b) Order Information</h4>
                                <ul className="list-disc list-inside space-y-1 text-sm">
                                    <li>Products ordered</li>
                                    <li>Order amount</li>
                                    <li>Payment method</li>
                                    <li>Order status</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <p className="text-sm font-medium text-yellow-800">
                                We do NOT store your bank account details, card details, or UPI PINs.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <RefreshCw className="text-green-600" /> 2. How We Use Your Information
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Process and verify orders</li>
                            <li>Confirm payments</li>
                            <li>Arrange shipping and delivery</li>
                            <li>Send order updates via WhatsApp / SMS</li>
                            <li>Handle refunds, cancellations, and support requests</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Lock className="text-green-600" /> 3. Payment Information
                        </h3>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Payments made via UPI or bank transfer go directly to our bank account</li>
                            <li>We only store transaction references (UTR) for verification</li>
                            <li>We do not have access to your UPI app or credentials</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Share2 className="text-green-600" /> 4. Sharing of Information
                        </h3>
                        <p className="mb-2">We do not sell or rent your personal data. We may share information only with:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Courier partners (for delivery)</li>
                            <li>Messaging services (WhatsApp / SMS) for order updates</li>
                            <li>Legal authorities if required by law</li>
                        </ul>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Shield className="text-green-600" /> 5. Data Security
                        </h3>
                        <p className="mb-2">We take reasonable steps to protect your data:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Limited access to admin systems</li>
                            <li>Secure servers and databases</li>
                            <li>Manual verification of payments</li>
                        </ul>
                        <p className="text-sm text-gray-500 mt-2 italic">However, no online transmission is 100% secure.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <Cookie className="text-green-600" /> 6. Cookies
                        </h3>
                        <p>Our website may use basic cookies to improve user experience and maintain session information. You can disable cookies in your browser if you prefer.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
                            <UserCheck className="text-green-600" /> 7. User Responsibilities
                        </h3>
                        <p>You are responsible for providing accurate personal and payment information and keeping your transaction details confidential.</p>
                    </section>

                    <section>
                        <h3 className="text-xl font-bold text-gray-900 mb-4">8. Changes to This Policy</h3>
                        <p>Vaddadi Pickles reserves the right to update this Privacy Policy at any time. Changes will be effective immediately once posted on the website.</p>
                    </section>

                    <section className="bg-green-50 p-6 rounded-xl border border-green-100">
                        <h3 className="text-xl font-bold text-gray-900 mb-4">9. Contact Us</h3>
                        <p className="mb-4">For privacy-related concerns, contact us at:</p>
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
