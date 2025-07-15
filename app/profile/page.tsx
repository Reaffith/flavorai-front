"use client";
import { useState, useEffect } from "react";
import { StatusNotification } from "../components/StatusNotification";
import { fetchMyComments, fetchRecipes, fetchUser } from "../functions/api";
import { RecipeCardMemo } from "../components/RecipeCard";
import { CommentCardMemo } from "../components/CommentCard";

interface User {
  id: number;
  name: string;
  email: string;
}

interface Recipe {
  id: number;
  title: string;
  description?: string;
  cuisine?: string;
  time: number;
  ingredients: string[];
  steps: string[];
  image?: string | null;
  authorId: number;
}

interface Comment {
  id: number;
  authorId: number;
  recipeId: number;
  title?: string;
  description?: string;
  rating: number;
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view your profile");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const userResponse = await fetchUser(token);

        setUser(userResponse);

        const recipesResponse = await fetchRecipes(token);

        setRecipes(
          recipesResponse.filter(
            (recipe: Recipe) => recipe.authorId === userResponse.id
          )
        );

        const commentsResponse = await fetchMyComments(token, userResponse.id);

        setComments(commentsResponse);
      } catch (err: unknown) {
        if (err && typeof err === "object" && "message" in err) {
          setError((err as { message: string }).message);
        } else {
          setError("An unknown error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8z"
          />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        Profile
      </h1>
      {error && (
        <StatusNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      <div className="container mx-auto max-w-4xl">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            User Info
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            Name: {user?.name || "N/A"}
          </p>
          <p className="text-gray-600 text-sm sm:text-base">
            Email: {user?.email || "N/A"}
          </p>
        </div>

        <div className="mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            My Recipes
          </h2>
          {recipes.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recipes.map((recipe) => (
                <RecipeCardMemo recipe={recipe} key={recipe.id} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">
              No recipes yet.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            My Comments
          </h2>
          {comments.length ? (
            <div className="space-y-4">
              {comments.map((comment) => (
                <CommentCardMemo comment={comment} key={comment.id} />
              ))}
            </div>
          ) : (
            <p className="text-gray-600 text-sm sm:text-base">
              No comments yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
