import Comment from "./Comment";
import LoadingSpinner from "./LoadingSpinner";

const ReviewsList = ({ reviews, isLoading, isError, productId }) => {
	if (isLoading) {
		return (
			<div className='flex justify-center items-center h-40'>
				<LoadingSpinner />
			</div>
		);
	}

	if (isError) {
		return <p className='text-red-400'>Failed to load reviews.</p>;
	}

	if (!reviews || reviews.length === 0) {
		return <p className='text-gray-400'>No reviews yet. Be the first to review!</p>;
	}

	return (
		<div className='space-y-6'>
			{reviews.map((review) => (
				<Comment key={review._id} comment={review} productId={productId} topLevelReviewId={review._id} />
			))}
		</div>
	);
};

export default ReviewsList;