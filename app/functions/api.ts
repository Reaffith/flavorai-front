export const fetchUser = async (token: string) => {
  const res = await fetch("http://localhost:3000/auth/me", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

export const fetchRecipes = async (token: string) => {
  const res = await fetch("http://localhost:3000/recipes", {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

export const fetchMyComments = async (token: string, userID: number) => {
  const res = await fetch(`http://localhost:3000/reviews/author/${userID}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};

export const getSearchedRecepies = async (
  token: string,
  query: URLSearchParams
) => {
  const res = await fetch(`http://localhost:3000/recipes?${query.toString()}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await res.json();
};
