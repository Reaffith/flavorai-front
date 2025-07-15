"use client";
import { useState, useEffect} from "react";
import { StatusNotification } from "./components/StatusNotification";
import { fetchUser, getSearchedRecepies } from "./functions/api";
import { RecipeCardMemo } from "./components/RecipeCard";

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

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [maxTimeFilter, setMaxTimeFilter] = useState("");
  const [ingredientsFilter, setIngredientsFilter] = useState("");
  const [newRecipe, setNewRecipe] = useState({
    title: "",
    description: "",
    cuisine: "",
    time: 0,
    ingredients: "",
    steps: "",
    image: "",
  });
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Please log in to view recipes");

      return;
    }

    const fetchData = async () => {
      try {
        const userResponse = await fetchUser(token);
        setUserId(userResponse.id);

        // Отримати рецепти з фільтрами
        const query = new URLSearchParams();
        if (cuisineFilter) query.append("cuisine", cuisineFilter);
        if (maxTimeFilter) query.append("maxTime", maxTimeFilter);
        if (ingredientsFilter) query.append("ingredients", ingredientsFilter);
        const recipesResponse = await getSearchedRecepies(token, query);
        setRecipes(recipesResponse);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred");
        }
      }
    };

    fetchData();
  }, [cuisineFilter, maxTimeFilter, ingredientsFilter]);

  const handleCreateRecipe = async (e: React.FormEvent) => {
    const token = localStorage.getItem("token");
    e.preventDefault();

    if (!token) {
      setError("User not authenticated");
      return;
    }
    setIsFormLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const createRecipeDto = {
        title: newRecipe.title,
        description: newRecipe.description || undefined,
        cuisine: newRecipe.cuisine || undefined,
        time: Number(newRecipe.time) || 1,
        ingredients: newRecipe.ingredients
          ? newRecipe.ingredients.split(",").map((i) => i.trim())
          : [],
        steps: newRecipe.steps
          ? newRecipe.steps.split(",").map((s) => s.trim())
          : [],
        image: newRecipe.image || undefined,
        authorId: userId,
      };
      const response = await fetch("http://localhost:3000/recipes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(createRecipeDto),
      });

      const createdRecipe: Recipe = await response.json();

      setRecipes([...recipes, createdRecipe]);
      setSuccess("Recipe created successfully");
      setNewRecipe({
        title: "",
        description: "",
        cuisine: "",
        time: 0,
        ingredients: "",
        steps: "",
        image: "",
      });
    } catch (err) {
      setError("Failed to create recipe");
    } finally {
      setIsFormLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-800">
        Recipes
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

      <div className="container mx-auto max-w-4xl mb-8">
        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Filter Recipes
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="cuisineFilter"
                className="block text-sm font-medium text-gray-700"
              >
                Cuisine
              </label>
              <input
                type="text"
                id="cuisineFilter"
                value={cuisineFilter}
                onChange={(e) => setCuisineFilter(e.target.value)}
                placeholder="e.g., Italian"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label
                htmlFor="maxTimeFilter"
                className="block text-sm font-medium text-gray-700"
              >
                Max Time (minutes)
              </label>
              <input
                type="number"
                id="maxTimeFilter"
                value={maxTimeFilter}
                onChange={(e) => setMaxTimeFilter(e.target.value)}
                placeholder="e.g., 30"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
            <div>
              <label
                htmlFor="ingredientsFilter"
                className="block text-sm font-medium text-gray-700"
              >
                Ingredients (comma-separated)
              </label>
              <input
                type="text"
                id="ingredientsFilter"
                value={ingredientsFilter}
                onChange={(e) => setIngredientsFilter(e.target.value)}
                placeholder="e.g., tomato,cheese"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-lg shadow-lg mb-8">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
            Create New Recipe
          </h2>
          <form onSubmit={handleCreateRecipe} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700"
              >
                Title
              </label>
              <input
                type="text"
                required
                id="title"
                value={newRecipe.title}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, title: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-700"
              >
                Description
              </label>
              <textarea
                id="description"
                value={newRecipe.description}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, description: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="cuisine"
                className="block text-sm font-medium text-gray-700"
              >
                Cuisine
              </label>
              <input
                type="text"
                id="cuisine"
                value={newRecipe.cuisine}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, cuisine: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="time"
                className="block text-sm font-medium text-gray-700"
              >
                Time (minutes)
              </label>
              <input
                type="number"
                required
                id="time"
                value={newRecipe.time || ""}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, time: Number(e.target.value) })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="ingredients"
                className="block text-sm font-medium text-gray-700"
              >
                Ingredients (comma-separated)
              </label>
              <input
                type="text"
                id="ingredients"
                value={newRecipe.ingredients}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, ingredients: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="steps"
                className="block text-sm font-medium text-gray-700"
              >
                Steps (comma-separated)
              </label>
              <input
                type="text"
                id="steps"
                value={newRecipe.steps}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, steps: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <div>
              <label
                htmlFor="image"
                className="block text-sm font-medium text-gray-700"
              >
                Image URL (optional)
              </label>
              <input
                type="text"
                id="image"
                value={newRecipe.image}
                onChange={(e) =>
                  setNewRecipe({ ...newRecipe, image: e.target.value })
                }
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                disabled={isFormLoading}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 flex items-center justify-center"
              disabled={isFormLoading}
            >
              {isFormLoading ? (
                "Please wait"
              ) : (
                "Create Recipe"
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="container mx-auto max-w-4xl">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-4">
          All Recipes
        </h2>
        {recipes.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {recipes.map((recipe) => (
              <RecipeCardMemo recipe={recipe} key={recipe.id} />
            ))}
          </div>
        ) : (
          <p className="text-gray-600 text-sm sm:text-base">
            No recipes found.
          </p>
        )}
      </div>
    </div>
  );
}
