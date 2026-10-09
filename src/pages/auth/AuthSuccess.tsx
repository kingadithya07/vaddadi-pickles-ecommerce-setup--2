import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, ArrowRight } from 'lucide-react';

export function AuthSuccess() {
    const location = useLocation();
    const type = location.state?.type || 'registration';

    const content = {
        registration: {
            title: 'Wait One Last Step!',
            message: 'A confirmation link has been sent to your email. Please verify your email to complete registration and log in.',
            buttonText: 'Go to Login',
            link: '/login'
        },
        password_reset: {
            title: 'Password Updated!',
            message: 'Your password has been successfully reset. You can now use your new password to log in.',
            buttonText: 'Login Now',
            link: '/login'
        }
    }[type as 'registration' | 'password_reset'] || {
        title: 'Success!',
        message: 'Your action was successful.',
        buttonText: 'Continue',
        link: '/'
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4 py-12 bg-gray-50">
            <div className="w-full max-w-md text-center">
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="flex justify-center mb-6">
                        <div className="bg-green-100 p-4 rounded-full">
                            <CheckCircle size={48} className="text-green-600" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-800 mb-4">{content.title}</h2>
                    <p className="text-gray-600 mb-8">
                        {content.message}
                    </p>

                    <Link
                        to={content.link}
                        className="w-full bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition inline-flex items-center justify-center gap-2"
                    >
                        {content.buttonText}
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </div>
        </div>
    );
}
