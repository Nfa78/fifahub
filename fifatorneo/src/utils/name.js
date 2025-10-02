export function splitFullName(fullName = "") {
  const parts = fullName.trim().split(/\s+/);
  const name = parts.shift() || "";
  const surname = parts.join(" ") || "";
  return { name, surname };
}
