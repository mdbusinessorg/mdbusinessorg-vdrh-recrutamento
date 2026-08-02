import { NextRequest, NextResponse } from "next/server";
import { createServiceRoleClient, getAuthenticatedUser, isAdmin } from "@/lib/supabase-server";
import { PDFParse } from "pdf-parse";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

interface CVParseResult {
  full_name?: string;
  bio_longa?: string;
  formacao?: string;
  certificacoes?: string[];
  skills?: string[];
  experiencia?: string;
  titulo?: string;
  cargo_alvo?: string;
  skills_cobertas?: string[];
}

async function parseCVWithGroq(text: string, apiKey: string): Promise<CVParseResult | null> {
  const system = `Extrai informações estruturadas de um CV em português.
Devolve APENAS um objecto JSON válido com as chaves:
- full_name (string)
- bio_longa (string, resumo profissional em 3-5 frases)
- formacao (string)
- certificacoes (array de strings)
- skills (array de strings)
- experiencia (string)
- titulo (string, sugestão de título para o CV, ex: "CV Rigger")
- cargo_alvo (string, cargo principal do candidato)
- skills_cobertas (array de strings, skills técnicas cobertas pelo CV)

Não inventes dados que não estejam no CV. Se não encontrares, usa arrays vazios e strings vazias.`;

  const user = `CV EM TEXTO:\n${text.slice(0, 6000)}`;

  const resp = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" },
    }),
  });

  if (!resp.ok) {
    console.error("Groq CV parse error:", await resp.text());
    return null;
  }

  const json = await resp.json();
  const content = json.choices?.[0]?.message?.content;
  if (!content) return null;
  try {
    return JSON.parse(content) as CVParseResult;
  } catch {
    return null;
  }
}

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

    const arrayBuffer = await file.arrayBuffer();

    let cvText = "";
    let parsed: CVParseResult | null = null;

    try {
      const pdf = new PDFParse({ data: arrayBuffer });
      const pdfResult = await pdf.getText();
      cvText = pdfResult.text || "";
      const apiKey = process.env.GROQ_API_KEY;
      if (apiKey && cvText.trim().length > 50) {
        parsed = await parseCVWithGroq(cvText, apiKey);
      }
    } catch (e) {
      console.warn("Falha ao fazer parse do PDF:", e);
    }

    const supabase = createServiceRoleClient();

    try {
      await supabase.storage.createBucket("cvs", { public: false });
    } catch {
      // ignore if exists
    }

    const storagePath = `${user!.id}/${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from("cvs").upload(storagePath, file, {
      upsert: true,
      contentType: "application/pdf",
    });
    if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 });

    const titulo = parsed?.titulo || String(formData.get("titulo") || "CV");
    const cargo_alvo = parsed?.cargo_alvo || String(formData.get("cargo_alvo") || "");
    const skillsRaw = String(formData.get("skills_cobertas") || "");
    const skills_cobertas = parsed?.skills_cobertas?.length
      ? parsed.skills_cobertas
      : skillsRaw.split(",").map((s) => s.trim()).filter(Boolean);
    const ativo = formData.get("ativo") === "on";

    const cvPayload = {
      user_id: user!.id,
      titulo,
      cargo_alvo,
      arquivo_url: storagePath,
      skills_cobertas,
      conteudo_texto: cvText.slice(0, 20000),
      ativo,
    };

    const { data: cv, error } = await supabase.from("candidate_cvs").insert(cvPayload).select("*").single();
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    if (parsed?.full_name) {
      const { data: existingProfile } = await supabase
        .from("candidate_profile")
        .select("id")
        .eq("user_id", user!.id)
        .single();

      const profilePayload: any = {
        user_id: user!.id,
        full_name: parsed.full_name || "",
        bio_longa: parsed.bio_longa || "",
        formacao: parsed.formacao || "",
        certificacoes: parsed.certificacoes || [],
        skills: parsed.skills || [],
        referencias: [],
      };

      if (existingProfile) {
        const { error: profileError } = await supabase
          .from("candidate_profile")
          .update(profilePayload)
          .eq("user_id", user!.id);
        if (profileError) console.error("Erro ao actualizar perfil:", profileError);
      } else {
        const { error: profileError } = await supabase.from("candidate_profile").insert(profilePayload);
        if (profileError) console.error("Erro ao criar perfil:", profileError);
      }
    }

    return NextResponse.json({ ok: true, cv, parsed });
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
