// Product Categories and Subcategories

export const CATEGORIES = {
  "Men's Collection": {
    label: "Men's Collection",
    subcategories: {
      "Tops": ["T-Shirts", "Shirts", "Polos", "Hoodies", "Sweaters"],
      "Bottoms": ["Jeans", "Pants", "Shorts", "Joggers"],
      "Outerwear": ["Jackets", "Coats", "Blazers", "Vests"]
    }
  },
  "Women's Collection": {
    label: "Women's Collection",
    subcategories: {
      "Tops": ["T-Shirts", "Shirts", "Blouses", "Hoodies", "Sweaters", "Tank Tops"],
      "Bottoms": ["Jeans", "Pants", "Shorts", "Skirts", "Leggings"],
      "Outerwear": ["Jackets", "Coats", "Blazers", "Cardigans"],
      "Dresses": ["Casual Dresses", "Formal Dresses", "Maxi Dresses", "Mini Dresses"]
    }
  },
  "Unisex": {
    label: "Unisex",
    subcategories: {
      "Tops": ["T-Shirts", "Hoodies", "Sweaters", "Sweatshirts"],
      "Bottoms": ["Jeans", "Joggers", "Sweatpants"],
      "Outerwear": ["Jackets", "Hoodies", "Windbreakers"]
    }
  },

  "Sportswear": {
    label: "Sportswear",
    subcategories: {
      "Athletic Wear": ["Sports T-Shirts", "Tank Tops", "Jerseys", "Tracksuits"],
      "Bottoms": ["Joggers", "Track Pants", "Shorts", "Leggings"],
      "Outerwear": ["Windbreakers", "Hoodies", "Jackets"]
    }
  },
  "Vintage": {
    label: "Vintage",
    subcategories: {
      "Vintage Tops": ["Vintage T-Shirts", "Vintage Shirts", "Vintage Sweaters", "Band Tees"],
      "Vintage Bottoms": ["Vintage Jeans", "Vintage Pants", "Vintage Shorts"],
      "Vintage Outerwear": ["Vintage Jackets", "Vintage Coats", "Leather Jackets", "Denim Jackets"]
    }
  }
};

// Get all categories as array
export const getCategoriesList = () => {
  return Object.keys(CATEGORIES);
};

// Get subcategories for a specific category
export const getSubcategories = (category) => {
  return CATEGORIES[category]?.subcategories || {};
};

// Get all subcategories as flat array for a category
export const getSubcategoriesList = (category) => {
  const subcats = getSubcategories(category);
  const allSubcats = [];
  
  Object.values(subcats).forEach(items => {
    allSubcats.push(...items);
  });
  
  return allSubcats;
};

// Get subcategory groups (Tops, Bottoms, etc.) for a category
export const getSubcategoryGroups = (category) => {
  return Object.keys(CATEGORIES[category]?.subcategories || {});
};

// Check if a subcategory exists in a category
export const isValidSubcategory = (category, subcategory) => {
  const allSubcats = getSubcategoriesList(category);
  return allSubcats.includes(subcategory);
};
