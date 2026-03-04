interface WelcomeScreenProps {
  onSuggestionClick: (text: string) => void
}

const suggestions = [
  "Che meteo c'\u00e8 sulla Milano-Roma domani?",
  'Quali corridoi alpini sono pi\u00f9 rischiosi questa settimana?',
  'Confronta A1 e A14 per Bologna-Napoli',
  'Pianifica le rotte della settimana',
]

export function WelcomeScreen({ onSuggestionClick }: WelcomeScreenProps) {
  return (
    <div className="flex flex-1 items-start justify-center px-4 pt-[12vh]">
      <div className="max-w-2xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-white">
          Ciao, come posso aiutarti?
        </h1>
        <p className="text-gray-400 mt-2">
          Chiedimi previsioni meteo sulle tue rotte, consigli su corridoi
          logistici, o analisi dei percorsi.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-8">
          {suggestions.map((text) => (
            <button
              key={text}
              onClick={() => onSuggestionClick(text)}
              className="p-4 border border-gray-700 rounded-2xl text-left text-sm text-gray-300 hover:bg-gray-800 hover:border-primary-500/50 cursor-pointer transition-all"
            >
              {text}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
