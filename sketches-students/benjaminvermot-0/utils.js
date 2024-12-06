class Utils {
  constructor(ctx) {
    this.ctx = ctx;
  }
  loadSVG(svgUrl, callback) {
    const img = new Image();

    img.onload = function () {
      // Dessine l'image SVG sur le canevas
      this.ctx.drawImage(img, 0, 0);

      // Exécute le callback après avoir chargé et dessiné l'image
      callback();
    };

    img.onerror = function () {
      console.error(`Erreur lors du chargement du fichier SVG: ${svgUrl}`);
    };

    img.src = svgUrl;
  }

  // Calcule la distance entre deux points
  getDistance(point1, point2) {
    const dx = point2.x - point1.x;
    const dy = point2.y - point1.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // Calcule la vitesse d'un mouvement (magnitude d'un vecteur)
  getSpeed(movement) {
    return Math.sqrt(movement.x * movement.x + movement.y * movement.y);
  }

  // Normalise un vecteur et applique une vitesse donnée
  getDirection(vector, speed) {
    const length = this.getSpeed(vector);
    if (length === 0) return { x: 0, y: 0 };

    return {
      x: (vector.x / length) * speed,
      y: (vector.y / length) * speed,
    };
  }
}

export default new Utils();
