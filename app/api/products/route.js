import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { INITIAL_PRODUCTS } from "@/data/products";

function dbToProduct(row) {
  const imgs = Array.isArray(row.images) && row.images.length ? row.images
             : row.image ? [row.image] : [];
  return {
    id:            row.id,
    name:          row.name,
    category:      row.category,
    price:         Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : null,
    images:        imgs,
    image:         imgs[0] || "",        // backward compat
    description:   row.description,
    colors:        row.colors || [],
    sizes:         row.sizes || [],
    badge:         row.badge || null,
    inStock:       row.in_stock,
    featured:      row.featured,
    rating:        Number(row.rating) || 0,
    reviews:       Number(row.reviews) || 0,
    createdAt:     row.created_at,
  };
}

// GET /api/products
export async function GET() {
  if (!supabase) {
    return NextResponse.json({ products: INITIAL_PRODUCTS });
  }
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return NextResponse.json({ products: data?.length ? data.map(dbToProduct) : INITIAL_PRODUCTS });
  } catch (err) {
    console.error("GET /api/products:", err.message);
    return NextResponse.json({ products: INITIAL_PRODUCTS });
  }
}

// POST /api/products
export async function POST(request) {
  if (!supabase) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }
  try {
    const body = await request.json();

    // Support both images[] array and single image string
    const imgs = Array.isArray(body.images) && body.images.length
      ? body.images
      : body.image ? [body.image] : [];

    const productData = {
      name:          body.name?.trim(),
      category:      body.category || "Sarees",
      price:         Number(body.price),
      original_price: body.originalPrice ? Number(body.originalPrice) : null,
      images:        imgs,
      image:         imgs[0] || "",     // backward compat column
      description:   body.description?.trim() || "",
      colors:        Array.isArray(body.colors) ? body.colors : [],
      sizes:         Array.isArray(body.sizes)  ? body.sizes  : [],
      badge:         body.badge || null,
      in_stock:      body.inStock ?? true,
      featured:      body.featured ?? false,
      rating:        parseFloat(body.rating) || 0,
      reviews:       parseInt(body.reviews)  || 0,
    };

    const { data, error } = await supabase
      .from("products")
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ product: dbToProduct(data) });
  } catch (err) {
    console.error("POST /api/products:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";
// import { INITIAL_PRODUCTS } from "@/data/products";

// function dbToProduct(row) {
//   return {
//     id:            row.id,
//     name:          row.name,
//     category:      row.category,
//     price:         Number(row.price),
//     originalPrice: row.original_price ? Number(row.original_price) : null,
//     image:         row.image,
//     description:   row.description,
//     colors:        row.colors || [],
//     sizes:         row.sizes || [],
//     badge:         row.badge || null,
//     inStock:       row.in_stock,
//     featured:      row.featured,
//     rating:        Number(row.rating) || 0,
//     reviews:       Number(row.reviews) || 0,
//     createdAt:     row.created_at,
//   };
// }

// // GET /api/products
// export async function GET() {
//   if (!supabase) {
//     console.warn("Supabase not configured — returning initial products");
//     return NextResponse.json({ products: INITIAL_PRODUCTS });
//   }
//   try {
//     const { data, error } = await supabase
//       .from("products")
//       .select("*")
//       .order("created_at", { ascending: false });

//     if (error) throw error;
//     return NextResponse.json({ products: data?.length ? data.map(dbToProduct) : INITIAL_PRODUCTS });
//   } catch (err) {
//     console.error("GET /api/products:", err.message);
//     return NextResponse.json({ products: INITIAL_PRODUCTS });
//   }
// }

// // POST /api/products
// export async function POST(request) {
//   if (!supabase) {
//     return NextResponse.json({ error: "Database not configured. .env mein SUPABASE_URL aur SUPABASE_SERVICE_KEY daalo." }, { status: 500 });
//   }
//   try {
//     const body = await request.json();

//     const productData = {
//       name:          body.name?.trim(),
//       category:      body.category || "Sarees",
//       price:         Number(body.price),
//       original_price: body.originalPrice ? Number(body.originalPrice) : null,
//       image:         body.image?.trim() || "",
//       description:   body.description?.trim() || "",
//       colors:        Array.isArray(body.colors) ? body.colors : [],
//       sizes:         Array.isArray(body.sizes) ? body.sizes : [],
//       badge:         body.badge || null,
//       in_stock:      body.inStock ?? true,
//       featured:      body.featured ?? false,
//       rating:        parseFloat(body.rating) || 0,
//       reviews:       parseInt(body.reviews) || 0,
//     };

//     const { data, error } = await supabase
//       .from("products")
//       .insert([productData])
//       .select()
//       .single();

//     if (error) throw error;
//     return NextResponse.json({ product: dbToProduct(data) });
//   } catch (err) {
//     console.error("POST /api/products:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
