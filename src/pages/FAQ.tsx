import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const faqs = [
  {
    question: "How long do the pickles stay fresh?",
    answer: "Our pickles have a shelf life of 6 to 12 months when stored properly in a cool, dry place. Make sure to always use a clean, dry spoon to avoid moisture contamination."
  },
  {
    question: "Do you use any artificial preservatives?",
    answer: "No, we strictly avoid artificial preservatives, colors, and flavors. We rely on traditional methods of preservation using high-quality oil, salt, and spices."
  },
  {
    question: "Do you ship internationally?",
    answer: "Currently, we ship across India. We are working on setting up international shipping soon. Please subscribe to our newsletter to stay updated!"
  },
  {
    question: "How long does delivery take?",
    answer: "Standard delivery within India takes 3-7 business days depending on your location. Once your order is shipped, you will receive a tracking link."
  },
  {
    question: "What kind of oil do you use?",
    answer: "We use premium quality, cold-pressed groundnut oil or sesame (gingelly) oil depending on the traditional recipe of the specific pickle."
  },
  {
    question: "Can I place a bulk order for a wedding or event?",
    answer: "Absolutely! We specialize in bulk orders and 'Pelli Saare' (wedding gifts). Please contact our customer support team directly for special pricing and customization options."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Helmet>
        <title>FAQ - Vaddadi Pickles</title>
        <meta name="description" content="Got questions? Read our Frequently Asked Questions about shipping, ingredients, and storage for Vaddadi Pickles." />
      </Helmet>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
        <p className="text-lg text-gray-600">
          Have a question? We're here to help.
        </p>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div 
            key={index} 
            className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm"
          >
            <button
              className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-gray-50 transition-colors duration-200 focus:outline-none"
              onClick={() => toggleFaq(index)}
            >
              <span className="font-semibold text-lg text-gray-900 text-left">{faq.question}</span>
              {openIndex === index ? (
                <ChevronUp className="text-green-600 flex-shrink-0" />
              ) : (
                <ChevronDown className="text-gray-400 flex-shrink-0" />
              )}
            </button>
            
            {openIndex === index && (
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center bg-green-50 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Still have questions?</h3>
        <p className="text-gray-600 mb-4">Can't find the answer you're looking for? Please chat to our friendly team.</p>
        <a href="tel:8008129309" className="inline-block bg-green-600 text-white font-semibold px-6 py-3 rounded-md hover:bg-green-700 transition">
          Contact Us
        </a>
      </div>
    </div>
  );
}
