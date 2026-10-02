
import { ShieldCheck, Leaf, Heart } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

export function AboutUs() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <Helmet>
        <title>About Us - Vaddadi Pickles</title>
        <meta name="description" content="Learn about the history and tradition behind Vaddadi Pickles. Authentic recipes passed down through generations." />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About Vaddadi Pickles</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Bringing the authentic taste of tradition to your dining table.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <img 
            src="https://images.unsplash.com/photo-1596683741846-9d32b842323f?q=80&w=2069&auto=format&fit=crop" 
            alt="Traditional Indian Spices and Pickles" 
            className="rounded-lg shadow-lg w-full h-[400px] object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <p className="text-gray-600 mb-4 leading-relaxed">
            For generations, our family has been perfecting the art of pickle making. What started as a beloved tradition in our home kitchen has now grown into Vaddadi Pickles, a brand synonymous with quality, authenticity, and love.
          </p>
          <p className="text-gray-600 mb-4 leading-relaxed">
            We believe that a great pickle can transform any meal into a feast. That's why we meticulously source the freshest ingredients, handpick our spices, and follow age-old recipes passed down from our ancestors.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Every jar of Vaddadi Pickles is a testament to our commitment to preserving the rich culinary heritage of India. We don't just make pickles; we bottle memories.
          </p>
        </div>
      </div>

      <div className="bg-green-50 rounded-2xl p-8 md:p-12 mb-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">Why Choose Us?</h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Leaf size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">100% Natural</h3>
            <p className="text-gray-600">No artificial preservatives or colors. Just pure, natural ingredients.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <Heart size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Made with Love</h3>
            <p className="text-gray-600">Handcrafted in small batches to ensure the perfect taste and quality.</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Premium Quality</h3>
            <p className="text-gray-600">We use only the finest spices, oils, and seasonal produce available.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
