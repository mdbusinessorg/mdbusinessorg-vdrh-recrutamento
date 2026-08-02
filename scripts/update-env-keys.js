// Atualiza .env.local com as legacy keys (JWT) correctas do projecto Supabase
const fs = require("fs");
const path = require("path");

const REF = "noywnuafpxvxvmfkjtbh";
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN;

if (!TOKEN) {
  console.error("Falta SUPABASE_ACCESS_TOKEN");
  process.exit(1);
}

async function main() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/api-keys`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  });
  if (!res.ok) {
    console.error("Falha ao obter keys:", await res.text());
    process.exit(1);
  }
  const keys = await res.json();

  const anon = keys.find((k) => k.name === "anon" && k.type === "legacy");
  const service = keys.find((k) => k.name === "service_role" && k.type === "legacy");
  if (!anon || !service) {
    console.error("Keys legacy não encontradas");
    process.exit(1);
  }

  const envPath = path.resolve(process.cwd(), ".env.local");
  let content = "";
  if (fs.existsSync(envPath)) {
    content = fs.readFileSync(envPath, "utf-8");
  }

  const setOrReplace = (key, value) => {
    const regex = new RegExp(`^${key}=.*$`, "m");
    if (regex.test(content)) {
      content = content.replace(regex, `${key}=${value}`);
    } else {
      content += `${content.endsWith("\n") ? "" : "\n"}${key}=${value}\n`;
    }
  };

  setOrReplace("NEXT_PUBLIC_SUPABASE_ANON_KEY", anon.api_key);
  setOrReplace("SUPABASE_SERVICE_ROLE_KEY", service.api_key);

  fs.writeFileSync(envPath, content, "utf-8");
  console.log("Keys actualizadas em .env.local");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
