import { Button } from '@nextui-org/react';
import axios from 'axios';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

const initialRecommendations = [
  "Reduce dining out expenses by 20%",
  "Consider a cheaper phone plan",
  "Look for ways to lower your utility bills",
  "Set up automatic savings transfers",
  "Review and cancel unused subscriptions",
];

export default function Recommendations() {
  const [recommends, setRecommends] = useState(initialRecommendations);
  const [isSubmitting, setIsSubmitting] = useState(false)
  const suggest = async () => {
    setIsSubmitting(true)
    try {
      const response = await axios.post('/api/recommend');

      // Split the recommendations string
      const stringsRecommends = response.data.answer
      const test = stringsRecommends.split('||')
      setRecommends(test);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    }
    finally{
      setIsSubmitting(false)
    }
  };

  return (
    <div className="p-6 bg-gray-100 rounded-lg shadow-lg">
      <div className="flex flex-row justify-between items-center mb-6">
        <h2 className="text-3xl font-semibold text-gray-800">Budget Recommendations</h2>
        <Button
          onPress={suggest}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin h-5 w-5" />
              <span>Processing...</span>
            </>
          ) : (
            <span>Recommend</span>
          )}
        </Button>
      </div>
      <ul className="space-y-4">
        {recommends.map((recommendation, index) => (
          <li
            key={index}
            className="flex items-start bg-white p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-300"
          >
            <CheckCircle className="mr-3 h-6 w-6 text-green-500 flex-shrink-0" />
            <span className="text-gray-700">{recommendation}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  
}
