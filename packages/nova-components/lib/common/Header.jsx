const Header = props => {
  
  ({Logo, ListContainer, CategoriesList} = Telescope.components);

  const logoUrl = Telescope.settings.get("logoUrl");
  const siteTitle = Telescope.settings.get("title", "Telescope");
  const tagline = Telescope.settings.get("tagline");

  return (
    <header className="header">
     <div className="logo">
        <Logo logoUrl={logoUrl} siteTitle={siteTitle} />
        {tagline ? <h2 className="tagline">{tagline}</h2> : "" }
      </div>
      <div className="nav">
        <ListContainer collection={Categories} publication="categories" component={CategoriesList} limit={0}/>
      </div>
    </header>
  )
}

module.exports = Header;