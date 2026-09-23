// Límite de tiempo por ejecución del sandbox. Fuente única: lo usa el
// adaptador para matar el proceso y el DTO del estudiante para mostrarle el
// mismo número (la pantalla decía «1000 ms» fijo cuando el límite real es otro).
export const SANDBOX_TIMEOUT_MS = 2000;
