import Link from "next/link";
import { memo } from "react";

export const RecipeCard: React.FC<{
  recipe: {
    id: number;
    title: string;
    description?: string;
    cuisine?: string;
    time: number;
    ingredients: string[];
    steps: string[];
    image?: string | null;
    authorId: number;
  };
}> = ({ recipe }) => {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="p-4 sm:p-6">
        <Link href={`/recipe/${recipe.id}`} className="text-lg sm:text-xl font-semibold text-gray-800">
          {recipe.title}
        </Link>
        <p className="text-gray-600 mt-2 text-sm sm:text-base line-clamp-3">
          {recipe.description || "No description"}
        </p>
        <p className="text-gray-500 mt-1 text-sm">
          Cuisine: {recipe.cuisine || "General"}
        </p>
        <p className="text-gray-500 text-sm">Time: {recipe.time} min</p>
      </div>
    </div>
  );
};


export const RecipeCardMemo = memo(RecipeCard);