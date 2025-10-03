export function validateRdv(form) {
  const errors = {};
  if (!form.clientName?.trim()) errors.clientName = 'Nom du client requis';
  if (!form.location?.trim()) errors.location = 'Lieu requis';
  if (!form.accompagnant?.trim()) errors.accompagnant = "Nom de l'accompagnant requis";
  if (!form.date) errors.date = 'Date requise';
  if (!form.time) errors.time = 'Heure requise';
  const responses = form.responses || [];
  if (responses.length !== 4) errors.responses = '4 réponses requises';
  return { valid: Object.keys(errors).length === 0, errors };
}

export function normalizeRdv(form) {
  return {
    id: form.id ?? Date.now().toString(),
    clientName: form.clientName.trim(),
    location: form.location.trim(),
    accompagnant: form.accompagnant.trim(),
    date: form.date, // YYYY-MM-DD
    time: form.time, // HH:mm
    responses: [...(form.responses || [])],
    createdAt: form.createdAt ?? Date.now(),
  };
}
