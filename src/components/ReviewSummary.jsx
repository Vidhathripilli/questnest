import { ApiClientLms } from "@/service/ApiUserAccount";
import { useEffect, useState } from "react";
import { FaStar } from "react-icons/fa";
import { useSelector } from "react-redux";

export default function ReviewSummary() {
  const user = useSelector((state) => state.auth.user);
  const [summaryData, setSummaryData] = useState({
    average_rating: 0,
    total_reviews: 0,
    ratings: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviewSummary = async () => {
      try {
        setLoading(true);
        // For demo purposes, using static data that matches your API response
        // In production, uncomment the API call below
        const response = await ApiClientLms.get(`courses/${user.courseId}/reviews/summary`);
        if (response.status === 200) {
          setSummaryData(response.data);
        }
        
        // Mock data for demonstration
        // setSummaryData({
        //   average_rating: 2,
        //   total_reviews: 1,
        //   ratings: {
        //     1: 0,
        //     2: 100,
        //     3: 0,
        //     4: 0,
        //     5: 0
        //   }
        // });
      } catch (error) {
        console.log("Error fetching review summary:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.courseId) {
      fetchReviewSummary();
    } else {
      // Fetch anyway for demo purposes
      fetchReviewSummary();
    }
  }, [user?.courseId]);

  // Calculate percentages for the distribution bars
  const getPercentage = (count) => {
    return count || 0; // Return the count directly since your API returns percentages
  };

  // Render rating stars
  const renderStars = (rating) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <FaStar
            key={star}
            className={star <= rating ? "text-yellow-400" : "text-gray-300"}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="p-6 text-center">Loading review summary...</div>;
  }

  return (
    <div className="mt-6 mb-8 bg-white rounded-lg p-6 shadow-sm">
      <h3 className="text-xl font-semibold mb-4">Student Feedback</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Rating Distribution */}
        <div className="col-span-1">
          {[5, 4, 3, 2, 1].map((rating) => (
            <div key={rating} className="flex items-center mb-2">
              <span className="w-4 text-sm text-gray-700 mr-2">{rating}</span>
              <div className="w-5 h-5 text-yellow-400 mr-2">
                <FaStar />
              </div>
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full" 
                  style={{ width: `${getPercentage(summaryData.ratings[rating])}%` }}
                ></div>
              </div>
              <span className="ml-2 text-sm text-gray-600 w-10 text-right">
                {getPercentage(summaryData.ratings[rating])}%
              </span>
            </div>
          ))}
        </div>
        
        {/* Total Reviews */}
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-lg font-medium text-gray-700">Total Reviews</h4>
          <p className="text-gray-500">{summaryData.total_reviews} Reviews</p>
        </div>
        
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center">
          <h4 className="text-lg font-medium text-gray-700">Average Rating</h4>
          <div className="flex items-center">
            <span className="text-2xl font-bold mr-2">{summaryData.average_rating.toFixed(1)}</span>
            {renderStars(summaryData.average_rating)}
          </div>
        </div>
      </div>
    </div>
  );
}