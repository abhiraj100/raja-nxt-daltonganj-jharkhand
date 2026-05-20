import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

// PUT /api/products/[id] — product update karo
export async function PUT(request, { params }) {
  try {
    const id   = Number(params.id);
    const body = await request.json();

    const updates = {};
    if (body.name          !== undefined) updates.name           = body.name;
    if (body.category      !== undefined) updates.category       = body.category;
    if (body.price         !== undefined) updates.price          = Number(body.price);
    if (body.originalPrice !== undefined) updates.original_price = body.originalPrice ? Number(body.originalPrice) : null;
    if (body.images        !== undefined) { updates.images = body.images; updates.image = body.images[0] || ""; }
    if (body.image         !== undefined && !body.images) updates.image = body.image;
    if (body.description   !== undefined) updates.description    = body.description;
    if (body.colors        !== undefined) updates.colors         = body.colors;
    if (body.sizes         !== undefined) updates.sizes          = body.sizes;
    if (body.badge         !== undefined) updates.badge          = body.badge;
    if (body.inStock       !== undefined) updates.in_stock       = body.inStock;
    if (body.featured      !== undefined) updates.featured       = body.featured;
    if (body.rating        !== undefined) updates.rating         = parseFloat(body.rating) || 0;
    if (body.reviews       !== undefined) updates.reviews        = parseInt(body.reviews) || 0;

    const { error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PUT /api/products/[id] error:", err);
    return NextResponse.json({ error: err.message || "Update nahi ho saka." }, { status: 500 });
  }
}

// DELETE /api/products/[id] — product delete karo
export async function DELETE(request, { params }) {
  try {
    const id = Number(params.id);

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE /api/products/[id] error:", err);
    return NextResponse.json({ error: err.message || "Delete nahi ho saka." }, { status: 500 });
  }
}

// PATCH /api/products/[id] — stock toggle
export async function PATCH(request, { params }) {
  try {
    const id   = Number(params.id);
    const body = await request.json();

    const { error } = await supabase
      .from("products")
      .update({ in_stock: body.inStock })
      .eq("id", id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}


// import { supabase } from "@/lib/supabase";
// import { NextResponse } from "next/server";

// function noDb() {
//   return NextResponse.json({ error: "Database not configured." }, { status: 500 });
// }

// // PUT — update
// export async function PUT(request, { params }) {
//   if (!supabase) return noDb();
//   try {
//     const id   = params.id;
//     const body = await request.json();

//     const updates = {};
//     if (body.name          !== undefined) updates.name           = body.name;
//     if (body.category      !== undefined) updates.category       = body.category;
//     if (body.price         !== undefined) updates.price          = Number(body.price);
//     if (body.originalPrice !== undefined) updates.original_price = body.originalPrice ? Number(body.originalPrice) : null;
//     if (body.image         !== undefined) updates.image          = body.image;
//     if (body.description   !== undefined) updates.description    = body.description;
//     if (body.colors        !== undefined) updates.colors         = body.colors;
//     if (body.sizes         !== undefined) updates.sizes          = body.sizes;
//     if (body.badge         !== undefined) updates.badge          = body.badge;
//     if (body.inStock       !== undefined) updates.in_stock       = body.inStock;
//     if (body.featured      !== undefined) updates.featured       = body.featured;
//     if (body.rating        !== undefined) updates.rating         = parseFloat(body.rating) || 0;
//     if (body.reviews       !== undefined) updates.reviews        = parseInt(body.reviews) || 0;

//     const { error } = await supabase.from("products").update(updates).eq("id", id);
//     if (error) throw error;
//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("PUT /api/products/[id]:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // DELETE
// export async function DELETE(request, { params }) {
//   if (!supabase) return noDb();
//   try {
//     const { error } = await supabase.from("products").delete().eq("id", params.id);
//     if (error) throw error;
//     return NextResponse.json({ success: true });
//   } catch (err) {
//     console.error("DELETE /api/products/[id]:", err.message);
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }

// // PATCH — stock toggle
// export async function PATCH(request, { params }) {
//   if (!supabase) return noDb();
//   try {
//     const body  = await request.json();
//     const { error } = await supabase.from("products").update({ in_stock: body.inStock }).eq("id", params.id);
//     if (error) throw error;
//     return NextResponse.json({ success: true });
//   } catch (err) {
//     return NextResponse.json({ error: err.message }, { status: 500 });
//   }
// }
