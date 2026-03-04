export function General() {
  return (
    <div>
      <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-cyan-500 bg-clip-text text-transparent mb-3">Generali</h1>

      <div className="bg-[#1e293b] border border-[#334155] rounded-2xl p-6 space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Lingua</label>
          <select
            defaultValue="it"
            className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="it">Italiano</option>
            <option value="en">English</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Fuso orario</label>
          <select
            defaultValue="Europe/Rome"
            className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="Europe/Rome">Europa/Roma (CET)</option>
            <option value="Europe/London">Europa/Londra (GMT)</option>
            <option value="Europe/Berlin">Europa/Berlino (CET)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Formato data</label>
          <select
            defaultValue="dd/mm/yyyy"
            className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="dd/mm/yyyy">GG/MM/AAAA</option>
            <option value="mm/dd/yyyy">MM/GG/AAAA</option>
            <option value="yyyy-mm-dd">AAAA-MM-GG</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Unità di misura</label>
          <select
            defaultValue="metric"
            className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="metric">Metrico (km, kg)</option>
            <option value="imperial">Imperiale (mi, lb)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-400 mb-1">Valuta</label>
          <select
            defaultValue="EUR"
            className="w-full bg-[#334155] border border-slate-600 rounded-xl px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
          >
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dollaro ($)</option>
            <option value="GBP">Sterlina (£)</option>
          </select>
        </div>

        <button className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-700 text-white rounded-xl text-sm font-medium hover:from-emerald-600 hover:to-emerald-800 transition-colors">
          Salva modifiche
        </button>
      </div>
    </div>
  )
}
