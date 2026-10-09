import React, { useState, useEffect } from 'react';
import { X, Star, MessageSquare, Send, CheckCircle2, ShoppingCart } from 'lucide-react';
import { useStore } from '../store';
import { Product } from '../types';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface ReviewModalProps {
    product: Product;
    isOpen: boolean;
    onClose: () => void;
}

export function ReviewModal({ product, isOpen, onClose }: ReviewModalProps) {
    const { user, orders, reviews, addReview, fetchReviews } = useStore();
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const productReviews = reviews[product.id] || [];

    useEffect(() => {
        if (isOpen) {
            fetchReviews(product.id);
            setSuccess('');
            setError('');
        }
    }, [isOpen, product.id, fetchReviews]);

    if (!isOpen) return null;

    // Check if user has purchased this product and it was delivered
    const hasPurchased = orders.some(order =>
        order.status === 'delivered' &&
        order.items.some(item => item.product.id === product.id)
    );

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setError('');
        setSuccess('');

        const result = await addReview({
            productId: product.id,
            userId: user.id,
            userName: user.name,
            rating,
            comment,
        });

        if (result.success) {
            setSuccess(result.message);
            setComment('');
            setRating(5);
        } else {
            setError(result.message);
        }
        setIsSubmitting(false);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-green-50 rounded-t-2xl">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex-shrink-0 bg-white rounded-lg flex items-center justify-center text-3xl overflow-hidden shadow-sm">
                            {product.image.startsWith('http') || product.image.startsWith('/') ? (
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                product.image
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800">{product.name} Reviews</h3>
                            <div className="flex items-center gap-2">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            size={14}
                                            className={i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                        />
                                    ))}
                                </div>
                                <span className="text-sm font-medium text-gray-600">{product.rating.toFixed(1)} ({product.reviews} reviews)</span>
                            </div>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors text-gray-500">
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
                    {/* Review Submission Form */}
                    {user && hasPurchased && (
                        <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                                <MessageSquare size={18} /> Write a Review
                            </h4>

                            {success ? (
                                <div className="bg-green-100 text-green-800 p-4 rounded-lg flex items-center gap-3 mb-4">
                                    <CheckCircle2 size={20} />
                                    <p className="font-medium">{success}</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-600 font-medium">Your Rating:</span>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <button
                                                    key={s}
                                                    type="button"
                                                    onClick={() => setRating(s)}
                                                    className="focus:outline-none transform hover:scale-110 transition-transform"
                                                >
                                                    <Star
                                                        size={24}
                                                        className={s <= rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300 hover:text-yellow-200'}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <textarea
                                            placeholder="Share your experience with this product..."
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            required
                                            className="w-full p-4 border border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent min-h-[100px] bg-white text-gray-700"
                                        />
                                    </div>

                                    {error && (
                                        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="bg-green-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-md active:scale-95"
                                    >
                                        {isSubmitting ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Submit Review
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {!user && (
                        <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-8 text-center">
                            <p className="text-gray-600 mb-4 font-medium">Please login to share your experience</p>
                            <Link
                                to="/login"
                                className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition shadow-sm inline-block"
                            >
                                Login to Review
                            </Link>
                        </div>
                    )}

                    {user && !hasPurchased && (
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex items-start gap-3">
                            <div className="bg-blue-100 p-2 rounded-full text-blue-600 flex-shrink-0">
                                <ShoppingCart size={20} />
                            </div>
                            <div>
                                <p className="text-blue-800 font-bold mb-1">Buy this product to review</p>
                                <p className="text-blue-600 text-sm leading-relaxed">Only users who have actually purchased and received this product can leave a review. We value authentic feedback from our customers!</p>
                            </div>
                        </div>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                        <h4 className="font-bold text-gray-800 border-b pb-2 flex items-center gap-2">
                            Customer Feedback ({productReviews.length})
                        </h4>

                        {productReviews.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-3">
                                <MessageSquare size={48} className="opacity-20" />
                                <p className="italic">No reviews yet. Be the first to share your thoughts!</p>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {productReviews.map((review) => (
                                    <div key={review.id} className="border-b last:border-0 pb-6 animate-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <div className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base">
                                                    {review.userName}
                                                    <span className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                                        <CheckCircle2 size={10} strokeWidth={3} /> Verified Purchase
                                                    </span>
                                                </div>
                                                <div className="flex gap-0.5 my-1">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            size={12}
                                                            className={i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <span className="text-[10px] sm:text-xs text-gray-500 whitespace-nowrap bg-gray-50 px-2 py-1 rounded">
                                                {format(new Date(review.createdAt), 'MMM d, yyyy')}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                            {review.comment}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
