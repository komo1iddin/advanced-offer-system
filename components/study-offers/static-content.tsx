export function StaticHeader() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-3xl font-bold tracking-tight">Study in China</h1>
      <p className="text-muted-foreground">
        Discover study opportunities at top Chinese universities
      </p>
    </div>
  );
}

export function DegreeLevelsList() {
  // This data rarely changes so it can be statically generated
  const degreeLevels = [
    { name: "Bachelor", icon: "🎓" },
    { name: "Master", icon: "📚" },
    { name: "PhD", icon: "🔬" },
    { name: "Certificate", icon: "📜" },
    { name: "Diploma", icon: "🎯" },
    { name: "Language Course", icon: "🗣️" },
  ];
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 my-6">
      {degreeLevels.map((level) => (
        <a 
          key={level.name} 
          href={`/?degreeLevel=${encodeURIComponent(level.name)}`}
          className="bg-card hover:bg-accent flex flex-col items-center justify-center p-4 rounded-lg border transition-colors"
        >
          <span className="text-2xl mb-2">{level.icon}</span>
          <span className="text-sm font-medium">{level.name}</span>
        </a>
      ))}
    </div>
  );
}

// Information that rarely changes
export function AboutStudyingInChina() {
  return (
    <section className="bg-card border rounded-lg p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">Why Study in China?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <h3 className="font-medium mb-2">World-Class Education</h3>
          <p className="text-sm text-muted-foreground">
            China hosts over 40 universities in the QS World University Rankings, offering a high standard of education at a fraction of the cost of Western institutions.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Cultural Experience</h3>
          <p className="text-sm text-muted-foreground">
            Immerse yourself in one of the world's oldest civilizations while experiencing modern innovation and rapid development.
          </p>
        </div>
        <div>
          <h3 className="font-medium mb-2">Career Opportunities</h3>
          <p className="text-sm text-muted-foreground">
            Gain a competitive edge in the global job market with international experience and exposure to the world's second-largest economy.
          </p>
        </div>
      </div>
    </section>
  );
} 