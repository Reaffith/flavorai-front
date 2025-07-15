import { memo } from "react";

export const CommentCard: React.FC<{
  comment: {
    id: number;
    authorId: number;
    recipeId: number;
    title?: string;
    description?: string;
    rating: number
  };
}> = ({ comment }) => {
  return (
    <div key={comment.id} className="bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <p className="text-gray-600 text-sm sm:text-base">{comment.title}</p>
      <p className="text-gray-500 text-sm mt-2">{comment.rating} / 10</p>
      <p className="text-gray-500 text-sm mt-2">{comment.description}</p>
      <p className="text-gray-500 text-sm mt-2">
        Posted on Recipe #{comment.recipeId}
      </p>
    </div>
  );
};

export const CommentCardMemo = memo(CommentCard);
