import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!(await isAdmin(user))) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return NextResponse.json({ error: "Ficheiro em falta" }, { status: 400 });
    }
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Só PDF" }, { status: 400 });
    }

    const supabase = createServiceRoleClient();
    const storagePath = `${user!.id}/${Date.now()}_${file.name}`;

    try {
      await supabase.storage.createBucket("cvs", { public: false });
    } catch {
      // ignore if exists
    }

    const { error: uploadError } = await supabase.storage.from("cvs").upload(storagePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const titulo = String(formData.get("titulo") || "");
    const cargo_alvo = String(formData.get("cargo_alvo") || "");
    const skillsRaw = String(formData.get("skills_cobertas") || "");
    const ativo = formData.get("ativo") === "on";
    const skills_cobertas = skillsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const payload = {
      user_id: user!.id,
      titulo,
      cargo_alvo,
      arquivo_url: storagePath,
      skills_cobertas,
      ativo,
    };

    const { data, error } = await supabase.from("candidate_cvs").insert(payload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, cv: data });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getAuthenticatedUser();
  if (!(await isAdmin(user))) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "ID em falta" }, { status: 400 });

    const supabase = createServiceRoleClient();
    const { data: cv } = await supabase.from("candidate_cvs").select("arquivo_url").eq("id", id).single();
    if (cv?.arquivo_url) {
      await supabase.storage.from("cvs").remove([cv.arquivo_url]);
    }

    const { error } = await supabase.from("candidate_cvs").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
