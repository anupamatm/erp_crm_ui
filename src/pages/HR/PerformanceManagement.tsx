import React, { useEffect, useState } from 'react';
import performanceService, { PerformanceReview } from '../../services/hr/performanceService';
import PerformanceReviewModal from '../../components/HR/PerformanceReviewModal';
import { Button, IconButton } from '@mui/material';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

const PerformanceManagement: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await performanceService.getPerformanceReviews();
      setReviews(data);
    } catch (err) {
      setError('Failed to load performance reviews.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleOpenModal = (review: PerformanceReview | null = null) => {
    setSelectedReview(review);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedReview(null);
  };

  const handleSaveReview = async (review: PerformanceReview) => {
    try {
      if (review._id) {
        await performanceService.updatePerformanceReview(review._id, review);
      } else {
        await performanceService.createPerformanceReview(review);
      }
      fetchReviews(); // Refresh the list
    } catch (error) {
      console.error('Failed to save review', error);
      setError('Failed to save review.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><p>Loading...</p></div>;
  }

  if (error) {
    return <div className="text-red-500 text-center p-4">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Performance Management</h1>
        <Button onClick={() => handleOpenModal()} className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Review
        </Button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reviewer</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Date</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reviews.map((review) => (
              <tr key={review._id}>
                <td className="px-6 py-4 whitespace-nowrap">{typeof review.employee === 'object' ? review.employee.name : review.employee}</td>
                <td className="px-6 py-4 whitespace-nowrap">{typeof review.reviewer === 'object' ? review.reviewer.name : review.reviewer}</td>
                <td className="px-6 py-4 whitespace-nowrap">{review.reviewDate ? new Date(review.reviewDate).toLocaleDateString() : 'N/A'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <IconButton size="small" onClick={() => handleOpenModal(review)}>
                    <Edit className="h-4 w-4" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    style={{ color: '#ef4444' }} 
                    onClick={async () => {
                      if (review._id && window.confirm('Are you sure you want to delete this performance review?')) {
                        try {
                          await performanceService.deletePerformanceReview(review._id);
                          fetchReviews();
                        } catch (error) {
                          setError('Failed to delete performance review. Please try again.');
                          console.error('Delete error:', error);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </IconButton>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PerformanceReviewModal
        open={modalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveReview}
        review={selectedReview}
      />
    </div>
  );
};

export default PerformanceManagement;
