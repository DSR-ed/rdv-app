export default function FilterSort({
  search,
  onSearch,
  sortBy,
  sortDir,
  onSortBy,
  onSortDir,
  period,
  onPeriod,
}) {
  return (
    <div className="card">
      <div className="row two">
        <div>
          <label className="label" htmlFor="search">Recherche</label>
          <input
            id="search"
            className="input"
            type="text"
            placeholder="Rechercher (client, lieu, accompagnant, date)"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>
        <div className="row two">
          <div>
            <label className="label" htmlFor="period">Période</label>
            <select id="period" className="select" value={period} onChange={(e)=>onPeriod(e.target.value)}>
              <option value="all">Toutes</option>
              <option value="week">Cette semaine</option>
              <option value="month">Ce mois</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="sortBy">Trier par</label>
            <div className="row two">
              <select id="sortBy" className="select" value={sortBy} onChange={(e)=>onSortBy(e.target.value)}>
                <option value="date">Date</option>
                <option value="location">Lieu</option>
                <option value="clientName">Nom client</option>
              </select>
              <select className="select" value={sortDir} onChange={(e)=>onSortDir(e.target.value)}>
                <option value="asc">Ascendant</option>
                <option value="desc">Descendant</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
