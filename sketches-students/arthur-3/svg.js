async function loadSVGAndExtractPoints(filePath) {
    try {
      // Fetch the SVG file
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to load SVG: ${response.statusText}`);
      }
  
      // Parse the SVG content as text
      const svgText = await response.text();
  
      // Create a DOMParser to parse the SVG
      const parser = new DOMParser();
      const svgDocument = parser.parseFromString(svgText, "image/svg+xml");
      const svgElement = svgDocument.documentElement;
  
      const pointsArray = [];
  
      // Extract path points
      const paths = svgElement.querySelectorAll("path");
      paths.forEach((path) => {
        const pathLength = path.getTotalLength();
        const numPoints = 100; // Number of points to sample
        for (let i = 0; i <= numPoints; i++) {
          const point = path.getPointAtLength((i / numPoints) * pathLength);
          pointsArray.push([point.x, point.y]);
        }
      });
  
      return pointsArray;
    } catch (error) {
      console.error("Error loading or processing SVG:", error);
      return [];
    }
  }

  export { loadSVGAndExtractPoints };
  
  // Usage Example
  
  