import { NextResponse } from "next/server";
import { getState, setState } from "@/lib/local-state";

export async function GET(_request, { params }) {
  try {
    const value = await getState(params.key);
    return NextResponse.json({ value });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request, { params }) {
  try {
    const body = await request.json();
    const value = await setState(params.key, body.value);
    return NextResponse.json({ value });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
