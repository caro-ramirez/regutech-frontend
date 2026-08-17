export function claseSeveridad(severidad) {
  switch (severidad) {
    case "Crítica":
      return "rt-badge-critica";
    case "Alta":
      return "rt-badge-alta";
    case "Media":
      return "rt-badge-media";
    default:
      return "rt-badge-baja";
  }
}

export const COLOR_SEVERIDAD = {
  "Crítica": "#D8413C",
  Alta: "#E3703D",
  Media: "#F9C835",
  Baja: "#88B747",
};

export const OPCIONES_SEVERIDAD = ["Crítica", "Alta", "Media", "Baja"];
