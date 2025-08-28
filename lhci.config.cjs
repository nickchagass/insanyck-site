module.exports = {
  ci: {
    collect: {
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready on|started server|Listening",
      url: [
        "http://localhost:3000/",
        "http://localhost:3000/loja",
        "http://localhost:3000/produto/oversized-classic",
        "http://localhost:3000/sacola",
        "http://localhost:3000/checkout"
      ],
      numberOfRuns: 1
    },
    assert: {
      "categories:performance": [">=", 0.90],
      "categories:accessibility": [">=", 0.95],
      "categories:best-practices": [">=", 0.95],
      "categories:seo": [">=", 0.95]
    },
    upload: {
      target: "filesystem",
      outputDir: ".lighthouseci"
    }
  }
};