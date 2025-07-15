"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import { StatusNotification } from "@/app/components/StatusNotification";
import { fetchUser } from "@/app/functions/api";
import { CommentCardMemo } from "@/app/components/CommentCard";

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
  title?: string;
  description?: string;
  rating: number;
  authorId: number;
  recipeId: number;
}

export default function RecipePage() {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<number | null>(null);
  const { id } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rating, setRating] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view this page");
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const userResponse = await fetchUser(token);
        setUserId(userResponse.id);

        const recipeResponse = await fetch(
          `http://localhost:3000/recipes/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setRecipe(await recipeResponse.json());

        const commentsResponse = await fetch(
          `http://localhost:3000/reviews/recipe/${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setComments(await commentsResponse.json());
      } catch (err) {
        setError("Failed to load recipe or comments");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) {
      setError("User not authenticated");
      return;
    }
    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 10) {
      setError("Rating must be a number between 1 and 10");
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const commentDto = {
        title: title || undefined,
        description: description || undefined,
        rating: ratingNum,
        recipeId: Number(id),
        authorId: userId,
      };
      await fetch("http://localhost:3000/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(commentDto),
      });
      setTitle("");
      setDescription("");
      setRating("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to add comment");
      } else if (err instanceof Error) {
        setError(err.message || "Failed to add comment");
      } else {
        setError("Failed to add comment");
      }
    } finally {
      setIsLoading(false);
    }
  };
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

  if (!recipe) {
    return (
      <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
          Recipe Not Found
        </h1>
        <Link
          href="/"
          className="text-blue-600 hover:underline text-sm sm:text-base block text-center"
        >
          Back to Recipes
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        {recipe.title}
      </h1>
      {error && (
        <StatusNotification
          message={error}
          type="error"
          onClose={() => setError(null)}
        />
      )}
      {success && (
        <StatusNotification
          message={success}
          type="success"
          onClose={() => setSuccess(null)}
        />
      )}

      <div className="container mx-auto max-w-4xl">
        {/* Деталі рецепту */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Details
          </h2>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            <strong>Description:</strong>{" "}
            {recipe.description || "No description"}
          </p>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            <strong>Cuisine:</strong> {recipe.cuisine || "General"}
          </p>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            <strong>Time:</strong> {recipe.time} min
          </p>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            <strong>Ingredients:</strong>
          </p>
          <ul className="list-disc pl-5 text-gray-600 text-sm sm:text-base mb-2">
            {recipe.ingredients.map((ingredient, index) => (
              <li key={index}>{ingredient}</li>
            ))}
          </ul>
          <p className="text-gray-600 text-sm sm:text-base mb-2">
            <strong>Steps:</strong>
          </p>
          <ol className="list-decimal pl-5 text-gray-600 text-sm sm:text-base">
            {recipe.steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
          <Link
            href="/"
            className="text-blue-600 hover:underline text-sm sm:text-base block mt-4"
          >
            Back to Recipes
          </Link>
        </div>

        {/* Форма коментаря */}
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Add Comment
          </h2>
          {error && (
            <StatusNotification
              message={error}
              type="error"
              onClose={() => setError(null)}
            />
          )}
          <form onSubmit={handleCreateComment} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title (optional)
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description (optional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                rows={4}
                disabled={isLoading}
              />
            </div>
            <div>
              <label
                htmlFor="rating"
                className="block text-sm font-medium text-gray-700"
              >
                Rating (1–10)
              </label>
              <input
                type="number"
                id="rating"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                min="1"
                max="10"
                required
                disabled={isLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 flex items-center justify-center"
              disabled={isLoading}
            >
              {isLoading ? "Please wait" : "Add Comment"}
            </button>
          </form>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Comments
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
