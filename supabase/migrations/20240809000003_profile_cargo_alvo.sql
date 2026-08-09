ALTER TABLE candidate_profile ADD COLUMN IF NOT EXISTS cargo_alvo TEXT;

-- Sincroniza o cargo_alvo do perfil a partir do CV activo de cada candidato
UPDATE candidate_profile p
SET cargo_alvo = (
  SELECT c.cargo_alvo
  FROM candidate_cvs c
  WHERE c.user_id = p.user_id AND c.ativo = true
  ORDER BY c.created_at DESC
  LIMIT 1
)
WHERE cargo_alvo IS NULL OR cargo_alvo = '';
